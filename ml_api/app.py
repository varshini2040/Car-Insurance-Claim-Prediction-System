"""Flask service for Random Forest fraud scoring and image-pair verification."""

import logging
import os
import tempfile
from contextlib import ExitStack

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from image_matching.vehicle_similarity import get_vehicle_similarity

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "webp", "avif"}
IMAGE_THRESHOLDS = {
    "vehicle": float(os.getenv("VEHICLE_MATCH_THRESHOLD", "0.72")),
    "plate": float(os.getenv("PLATE_MATCH_THRESHOLD", "0.78")),
    "license": float(os.getenv("LICENSE_MATCH_THRESHOLD", "0.78")),
}
DECISION_WEIGHTS = {
    "fraud": 0.55,
    "vehicle": 0.20,
    "plate": 0.15,
    "license": 0.10,
}

model = None
scaler = None
label_encoder_gender = None
label_encoder_vehicle = None
image_similarity = None


def _load_joblib(filename, required=False):
    path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(path):
        if required:
            raise FileNotFoundError(path)
        return None
    return joblib.load(path)


def load_models():
    global model, scaler, label_encoder_gender, label_encoder_vehicle
    model = _load_joblib("best_insurance_model.pkl", required=True)
    scaler = _load_joblib("scaler.pkl")
    label_encoder_gender = _load_joblib("label_encoder_gender.pkl")
    label_encoder_vehicle = _load_joblib("label_encoder_vehicle.pkl")
    logger.info("Fraud prediction model loaded: %s", type(model).__name__)


def load_image_model():
    global image_similarity
    image_similarity = get_vehicle_similarity()
    if image_similarity.model is None:
        raise RuntimeError("TensorFlow image model could not be loaded")


def _number(data, key, default=0):
    try:
        return float(data.get(key, default))
    except (TypeError, ValueError):
        return float(default)


def _encode(encoder, value, fallback):
    if encoder is None:
        return fallback
    try:
        return int(encoder.transform([value])[0])
    except (ValueError, TypeError):
        return fallback


def predict_fraud(data):
    if model is None:
        raise RuntimeError("Fraud model is not loaded")

    gender = data.get("gender", "Male")
    vehicle_type = data.get("vehicle_type", "Sedan")
    gender_fallback = 1 if str(gender).lower() in {"male", "m"} else 0
    vehicle_map = {"sedan": 0, "suv": 1, "hatchback": 2, "truck": 3, "coupe": 4}

    values = [
        _number(data, "age"),
        _number(data, "vehicle_age"),
        _number(data, "annual_premium"),
        _number(data, "driving_experience"),
        _number(data, "accident_history"),
        _number(data, "claim_history"),
        _number(data, "credit_score", 600),
        _number(data, "policy_duration"),
        _encode(label_encoder_gender, gender, gender_fallback),
        _encode(label_encoder_vehicle, vehicle_type, vehicle_map.get(str(vehicle_type).lower(), 0)),
    ]
    features = np.asarray([values], dtype=float)
    prediction_input = scaler.transform(features) if scaler is not None else features
    prediction = int(model.predict(prediction_input)[0])

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(prediction_input)[0]
        classes = list(getattr(model, "classes_", range(len(probabilities))))
        fraud_index = classes.index(1) if 1 in classes else len(probabilities) - 1
        fraud_probability = float(probabilities[fraud_index]) * 100
    else:
        fraud_probability = float(prediction) * 100

    if fraud_probability >= 70:
        risk_level = "High"
    elif fraud_probability >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "prediction": prediction,
        "prediction_label": "Fraud" if prediction == 1 else "Genuine",
        "fraud_probability": round(fraud_probability, 2),
        "risk_level": risk_level,
        "model_used": type(model).__name__,
    }


def final_decision(fraud_probability, verification):
    mismatch_risk = {
        key: 100 - verification[key]["similarity"]
        for key in ("vehicle", "plate", "license")
    }
    score = round(
        fraud_probability * DECISION_WEIGHTS["fraud"]
        + mismatch_risk["vehicle"] * DECISION_WEIGHTS["vehicle"]
        + mismatch_risk["plate"] * DECISION_WEIGHTS["plate"]
        + mismatch_risk["license"] * DECISION_WEIGHTS["license"],
        2,
    )

    has_mismatch = any(not verification[key]["match"] for key in verification)
    if score >= 70:
        status, action = "Critical Risk", "Reject and escalate to fraud investigation"
    elif score >= 40 or has_mismatch:
        status, action = "Manual Review", "Hold claim and perform manual document verification"
    else:
        status, action = "Low Risk", "Proceed with normal claim processing"

    return {
        "overall_risk_score": score,
        "final_status": status,
        "recommended_action": action,
        "weights": DECISION_WEIGHTS,
    }


def _valid_upload(upload):
    return (
        upload
        and upload.filename
        and "." in upload.filename
        and upload.filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def _save_upload(upload, stack):
    suffix = os.path.splitext(upload.filename)[1].lower()
    temp = stack.enter_context(tempfile.NamedTemporaryFile(suffix=suffix, delete=False))
    upload.save(temp.name)
    stack.callback(lambda path=temp.name: os.path.exists(path) and os.remove(path))
    return temp.name


@app.post("/predict")
def predict():
    try:
        return jsonify({"success": True, **predict_fraud(request.get_json(silent=True) or {})})
    except Exception as exc:
        logger.exception("Prediction failed")
        return jsonify({"success": False, "error": str(exc)}), 500


@app.post("/analyze-claim")
def analyze_claim():
    """Analyze ML fields and three insurance/claim image pairs in one request."""
    required_files = {
        "insurance_vehicle": "vehicle",
        "claim_vehicle": "vehicle",
        "insurance_plate": "plate",
        "claim_plate": "plate",
        "insurance_license": "license",
        "claim_license": "license",
    }
    missing = [name for name in required_files if not _valid_upload(request.files.get(name))]
    if missing:
        return jsonify({"success": False, "error": f"Missing or invalid images: {', '.join(missing)}"}), 400
    if image_similarity is None or image_similarity.model is None:
        return jsonify({"success": False, "error": "Image similarity model is not loaded"}), 503

    try:
        fraud = predict_fraud(request.form)
        with ExitStack() as stack:
            paths = {
                name: _save_upload(request.files[name], stack) for name in required_files
            }
            verification = {
                "vehicle": image_similarity.compare_images(
                    paths["insurance_vehicle"],
                    paths["claim_vehicle"],
                    IMAGE_THRESHOLDS["vehicle"],
                ),
                "plate": image_similarity.compare_images(
                    paths["insurance_plate"],
                    paths["claim_plate"],
                    IMAGE_THRESHOLDS["plate"],
                ),
                "license": image_similarity.compare_images(
                    paths["insurance_license"],
                    paths["claim_license"],
                    IMAGE_THRESHOLDS["license"],
                ),
            }

        failed = [name for name, result in verification.items() if not result["success"]]
        if failed:
            return jsonify({
                "success": False,
                "error": f"Image comparison failed for: {', '.join(failed)}",
                "image_verification": verification,
            }), 422

        decision = final_decision(fraud["fraud_probability"], verification)
        return jsonify({
            "success": True,
            "fraud_detection": fraud,
            "image_verification": verification,
            "final_decision": decision,
        })
    except Exception as exc:
        logger.exception("Claim analysis failed")
        return jsonify({"success": False, "error": str(exc)}), 500


@app.post("/verify-vehicle")
def verify_vehicle():
    if not _valid_upload(request.files.get("image1")) or not _valid_upload(request.files.get("image2")):
        return jsonify({"success": False, "error": "image1 and image2 are required"}), 400
    threshold = min(max(float(request.form.get("threshold", 0.72)), 0), 1)
    with ExitStack() as stack:
        first = _save_upload(request.files["image1"], stack)
        second = _save_upload(request.files["image2"], stack)
        return jsonify(image_similarity.compare_images(first, second, threshold))


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "fraud_model": "loaded" if model is not None else "not_loaded",
        "image_model": image_similarity.get_model_info() if image_similarity else {"status": "not_loaded"},
        "thresholds": {key: value * 100 for key, value in IMAGE_THRESHOLDS.items()},
    })


if __name__ == "__main__":
    load_models()
    load_image_model()
    app.run(host="127.0.0.1", port=5001, debug=False)
