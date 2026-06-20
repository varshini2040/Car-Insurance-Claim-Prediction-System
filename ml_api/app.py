"""Flask service for Random Forest fraud scoring and image-pair verification."""

import logging
import os
import tempfile
from contextlib import ExitStack
from difflib import SequenceMatcher

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from image_matching.vehicle_similarity import get_vehicle_similarity

try:
    from ocr.plate_ocr import get_plate_ocr
except Exception:
    get_plate_ocr = None

try:
    from ocr.license_ocr import get_license_ocr
except Exception:
    get_license_ocr = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "webp", "avif"}
IMAGE_THRESHOLDS = {
    "vehicle": float(os.getenv("VEHICLE_MATCH_THRESHOLD", "0.55")),
    "plate": float(os.getenv("PLATE_MATCH_THRESHOLD", "0.78")),
    "license": float(os.getenv("LICENSE_MATCH_THRESHOLD", "0.78")),
}
PLATE_OCR_MATCH_THRESHOLD = float(os.getenv("PLATE_OCR_MATCH_THRESHOLD", "80"))
LICENSE_OCR_MATCH_THRESHOLD = float(os.getenv("LICENSE_OCR_MATCH_THRESHOLD", "80"))
VEHICLE_PLATE_CONFIRMED_MIN_SCORE = float(
    os.getenv("VEHICLE_PLATE_CONFIRMED_MIN_SCORE", "91")
)
VEHICLE_PLATE_BOOST_MIN_VISUAL = float(
    os.getenv("VEHICLE_PLATE_BOOST_MIN_VISUAL", "55")
)
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
plate_ocr = None
license_ocr = None


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


def load_ocr_models():
    global plate_ocr, license_ocr
    if get_plate_ocr is None:
        logger.warning("Plate OCR module is unavailable")
    else:
        plate_ocr = get_plate_ocr()

    if get_license_ocr is None:
        logger.warning("License OCR module is unavailable")
    else:
        license_ocr = get_license_ocr()


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


def _similarity_value(result):
    value = result.get("similarity")
    return float(value) if value is not None else 0.0


def final_decision(fraud_probability, verification):
    mismatch_risk = {
        key: 100 - _similarity_value(verification[key])
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


def normalize_identifier(value):
    """Normalize OCR output so common visual confusions do not hide a match."""
    if not value:
        return ""

    normalized = "".join(ch for ch in str(value).upper() if ch.isalnum())
    translation = str.maketrans({
        "O": "0",
        "Q": "0",
        "I": "1",
        "L": "1",
        "S": "5",
        "B": "8",
        "Z": "2",
    })
    return normalized.translate(translation)


def text_match_percentage(first, second):
    first_normalized = normalize_identifier(first)
    second_normalized = normalize_identifier(second)
    if not first_normalized or not second_normalized:
        return 0

    raw_score = SequenceMatcher(None, str(first).upper(), str(second).upper()).ratio()
    normalized_score = SequenceMatcher(None, first_normalized, second_normalized).ratio()
    return round(max(raw_score, normalized_score) * 100, 2)


def plate_ocr_report(
    insurance_plate_path,
    claim_plate_path,
    insurance_plate_number="",
    claim_license_plate="",
):
    if plate_ocr is None:
        match_percentage = text_match_percentage(insurance_plate_number, claim_license_plate)
        mismatch_reasons = []
        if insurance_plate_number and claim_license_plate and match_percentage < PLATE_OCR_MATCH_THRESHOLD:
            mismatch_reasons.append("Claim license plate does not match policy license plate")

        return {
            "success": bool(insurance_plate_number and claim_license_plate),
            "insured_plate": insurance_plate_number or None,
            "detected_plate": None,
            "submitted_claim_plate": claim_license_plate or None,
            "match_percentage": match_percentage,
            "mismatch_reasons": mismatch_reasons,
            "error": "Plate OCR is not loaded",
        }

    insured = plate_ocr.extract_plate_number(insurance_plate_path)
    detected = plate_ocr.extract_plate_number(claim_plate_path)
    insured_text = insured.get("plate_number") or ""
    detected_text = detected.get("plate_number") or ""
    policy_plate = insurance_plate_number or insured_text
    submitted_claim_plate = claim_license_plate or detected_text
    scores = []
    mismatch_reasons = []

    if policy_plate and submitted_claim_plate:
        policy_claim_score = text_match_percentage(policy_plate, submitted_claim_plate)
        scores.append(policy_claim_score)
        if policy_claim_score < PLATE_OCR_MATCH_THRESHOLD:
            mismatch_reasons.append("Claim license plate does not match policy license plate")

    if detected_text and submitted_claim_plate:
        detected_claim_score = text_match_percentage(detected_text, submitted_claim_plate)
        scores.append(detected_claim_score)
        if detected_claim_score < PLATE_OCR_MATCH_THRESHOLD:
            mismatch_reasons.append("Claim plate image OCR does not match submitted claim plate")

    if insured_text and detected_text:
        scores.append(text_match_percentage(insured_text, detected_text))

    match_percentage = round(min(scores), 2) if scores else 0

    return {
        "success": bool(insured.get("success") and detected.get("success")),
        "insured_plate": policy_plate or None,
        "insurance_image_plate": insured_text or None,
        "detected_plate": detected_text or None,
        "submitted_claim_plate": submitted_claim_plate or None,
        "match_percentage": match_percentage,
        "mismatch_reasons": mismatch_reasons,
        "error": insured.get("error") or detected.get("error"),
    }


def plate_verification_report(
    insurance_plate_path,
    claim_plate_path,
    threshold,
    insurance_plate_number="",
    claim_license_plate="",
):
    visual_result = image_similarity.compare_images(
        insurance_plate_path,
        claim_plate_path,
        threshold,
    )
    ocr_result = plate_ocr_report(
        insurance_plate_path,
        claim_plate_path,
        insurance_plate_number,
        claim_license_plate,
    )

    if (
        ocr_result["insured_plate"]
        or ocr_result["detected_plate"]
        or ocr_result["submitted_claim_plate"]
    ):
        match_percentage = ocr_result["match_percentage"]
        is_match = (
            match_percentage >= PLATE_OCR_MATCH_THRESHOLD
            and not ocr_result.get("mismatch_reasons")
        )
        return {
            "success": True,
            "similarity": match_percentage,
            "match": is_match,
            "threshold": PLATE_OCR_MATCH_THRESHOLD,
            "model": "Policy plate + claim plate + OCR text match",
            "ocr_match": is_match,
            "visual_similarity": visual_result.get("similarity"),
            "mismatch_reasons": ocr_result.get("mismatch_reasons", []),
            "verification_basis": (
                "Number plate identity is decided from stored policy/claim plates and OCR text. "
                "Visual image similarity is retained only as a fallback signal."
            ),
        }, ocr_result

    return {
        **visual_result,
        "verification_basis": "Plate OCR could not read text; used visual fallback.",
    }, ocr_result


def license_ocr_report(insurance_license_path, claim_license_path):
    if license_ocr is None:
        return {
            "success": False,
            "insured_license": None,
            "detected_license": None,
            "insured_name": None,
            "detected_name": None,
            "insured_dob": None,
            "detected_dob": None,
            "match_percentage": 0,
            "error": "License OCR is not loaded",
        }

    insured = license_ocr.extract_license_info(insurance_license_path)
    detected = license_ocr.extract_license_info(claim_license_path)

    insured_license = insured.get("license_number") or ""
    detected_license = detected.get("license_number") or ""
    name_score = text_match_percentage(insured.get("name") or "", detected.get("name") or "")
    dob_score = 100 if insured.get("dob") and insured.get("dob") == detected.get("dob") else 0

    score_parts = []
    if insured_license and detected_license:
        score_parts.append((text_match_percentage(insured_license, detected_license), 0.75))
    elif insured_license or detected_license:
        score_parts.append((0, 0.75))

    if insured.get("name") and detected.get("name"):
        score_parts.append((name_score, 0.15))

    if insured.get("dob") and detected.get("dob"):
        score_parts.append((dob_score, 0.10))

    if score_parts:
        weighted_score = sum(score * weight for score, weight in score_parts)
        total_weight = sum(weight for _score, weight in score_parts)
        license_score = round(weighted_score / total_weight, 2)
    else:
        license_score = 0

    return {
        "success": bool(insured.get("success") and detected.get("success")),
        "insured_license": insured_license or None,
        "detected_license": detected_license or None,
        "insured_name": insured.get("name"),
        "detected_name": detected.get("name"),
        "insured_dob": insured.get("dob"),
        "detected_dob": detected.get("dob"),
        "match_percentage": license_score,
        "error": insured.get("error") or detected.get("error"),
    }


def license_verification_report(insurance_license_path, claim_license_path, threshold):
    visual_result = image_similarity.compare_images(
        insurance_license_path,
        claim_license_path,
        threshold,
    )
    ocr_result = license_ocr_report(insurance_license_path, claim_license_path)

    has_identity_text = any(
        ocr_result.get(field)
        for field in (
            "insured_license",
            "detected_license",
            "insured_name",
            "detected_name",
            "insured_dob",
            "detected_dob",
        )
    )

    if has_identity_text:
        match_percentage = ocr_result["match_percentage"]
        return {
            "success": True,
            "similarity": match_percentage,
            "match": match_percentage >= LICENSE_OCR_MATCH_THRESHOLD,
            "threshold": LICENSE_OCR_MATCH_THRESHOLD,
            "model": "Driver license OCR text match",
            "visual_similarity": visual_result.get("similarity"),
            "verification_basis": (
                "Driver license identity is decided from OCR fields. "
                "Visual image similarity is retained only as a fallback signal."
            ),
        }, ocr_result

    return {
        **visual_result,
        "verification_basis": "License OCR could not read identity fields; used visual fallback.",
    }, ocr_result


def best_vehicle_reference_match(reference_paths, claim_path, threshold):
    results = [
        image_similarity.compare_images(reference_path, claim_path, threshold)
        for reference_path in reference_paths
    ]
    successful = [
        (index, result) for index, result in enumerate(results) if result.get("success")
    ]
    if not successful:
        return {
            "success": False,
            "similarity": None,
            "match": False,
            "threshold": round(threshold * 100, 2),
            "error": "Could not compare any insurance vehicle reference image",
            "reference_results": results,
        }

    best_index, best = max(
        successful,
        key=lambda item: item[1].get("similarity") or 0,
    )
    return {
        **best,
        "reference_index": best_index,
        "reference_results": results,
        "verification_basis": (
            "Best match across insurance vehicle reference images. "
            "Accident damage is tolerated when vehicle identity remains consistent."
        ),
    }


def apply_plate_identity_to_vehicle(vehicle_result, plate_ocr_result):
    """Use a matching plate as strong evidence that damaged vehicle photos are the same car."""
    plate_score = float(plate_ocr_result.get("match_percentage") or 0)
    visual_score = float(vehicle_result.get("similarity") or 0)
    if visual_score < VEHICLE_PLATE_BOOST_MIN_VISUAL:
        return {
            **vehicle_result,
            "visual_similarity": vehicle_result.get("similarity"),
            "match": False,
            "plate_identity_confirmed": False,
            "mismatch_reasons": [
                *vehicle_result.get("mismatch_reasons", []),
                (
                    "Vehicle images are visually too different for number plate text "
                    "to confirm vehicle identity."
                ),
            ],
            "verification_basis": (
                vehicle_result.get("verification_basis", "")
                + " Number plate text matched, but vehicle image similarity is too low "
                "to treat the vehicles as the same."
            ).strip(),
        }

    identity_score = max(
        visual_score,
        min(95.0, max(VEHICLE_PLATE_CONFIRMED_MIN_SCORE, 75.0 + (plate_score * 0.20))),
    )

    return {
        **vehicle_result,
        "similarity": round(identity_score, 2),
        "visual_similarity": vehicle_result.get("similarity"),
        "match": True,
        "plate_identity_confirmed": True,
        "verification_basis": (
            vehicle_result.get("verification_basis", "")
            + " Number plate OCR matched, so the vehicle identity score is boosted "
            "for before/after accident damage."
        ).strip(),
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
    descriptor, temp_path = tempfile.mkstemp(suffix=suffix)
    os.close(descriptor)
    upload.save(temp_path)
    stack.callback(lambda path=temp_path: os.path.exists(path) and os.remove(path))
    return temp_path


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
        "claim_vehicle": "vehicle",
        "insurance_plate": "plate",
        "claim_plate": "plate",
        "insurance_license": "license",
        "claim_license": "license",
    }
    missing = [name for name in required_files if not _valid_upload(request.files.get(name))]
    vehicle_reference_fields = [
        "insurance_vehicle",
        "insurance_vehicle_front",
        "insurance_vehicle_back",
        "insurance_vehicle_side",
    ]
    available_vehicle_references = [
        name for name in vehicle_reference_fields if _valid_upload(request.files.get(name))
    ]
    if not available_vehicle_references:
        missing.append("insurance_vehicle")
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
            insurance_vehicle_paths = [
                _save_upload(request.files[name], stack) for name in available_vehicle_references
            ]
            vehicle_result = best_vehicle_reference_match(
                insurance_vehicle_paths,
                paths["claim_vehicle"],
                IMAGE_THRESHOLDS["vehicle"],
            )
            insurance_plate_number = request.form.get("insurance_plate_number", "")
            claim_license_plate = request.form.get("claim_license_plate", "")
            plate_result, plate_ocr_result = plate_verification_report(
                paths["insurance_plate"],
                paths["claim_plate"],
                IMAGE_THRESHOLDS["plate"],
                insurance_plate_number,
                claim_license_plate,
            )
            plate_pair_same_file = str(request.form.get("plate_pair_same_file", "")).lower() == "true"
            if plate_pair_same_file:
                duplicate_reason = (
                    "Insurance plate image and claim plate image are the same uploaded file."
                )
                plate_ocr_result = {
                    **plate_ocr_result,
                    "match_percentage": 0,
                    "mismatch_reasons": [
                        *plate_ocr_result.get("mismatch_reasons", []),
                        duplicate_reason,
                    ],
                }
                plate_result = {
                    **plate_result,
                    "similarity": 0,
                    "match": False,
                    "ocr_match": False,
                    "mismatch_reasons": [
                        *plate_result.get("mismatch_reasons", []),
                        duplicate_reason,
                    ],
                    "verification_basis": (
                        "Plate verification failed because both plate references point "
                        "to the same uploaded file."
                    ),
                }
            license_result, license_ocr_result = license_verification_report(
                paths["insurance_license"],
                paths["claim_license"],
                IMAGE_THRESHOLDS["license"],
            )
            verification = {
                "vehicle": vehicle_result,
                "plate": plate_result,
                "license": license_result,
            }
            if plate_result.get("match"):
                verification["plate"] = {
                    **verification["plate"],
                    "similarity": plate_ocr_result["match_percentage"],
                    "match": True,
                    "ocr_match": True,
                    "verification_basis": "Number plate OCR matched insurance and claim plate numbers.",
                }
                verification["vehicle"] = apply_plate_identity_to_vehicle(
                    verification["vehicle"],
                    plate_ocr_result,
                )

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
            "plate_ocr": plate_ocr_result,
            "license_ocr": license_ocr_result,
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
        "plate_ocr": "loaded" if plate_ocr is not None else "not_loaded",
        "license_ocr": "loaded" if license_ocr is not None else "not_loaded",
        "thresholds": {key: value * 100 for key, value in IMAGE_THRESHOLDS.items()},
    })


if __name__ == "__main__":
    load_models()
    load_image_model()
    load_ocr_models()
    app.run(host="127.0.0.1", port=5001, debug=False)
