from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model = joblib.load("best_insurance_model.pkl")
scaler = joblib.load("scaler.pkl")
le_gender = joblib.load("label_encoder_gender.pkl")
le_vehicle = joblib.load("label_encoder_vehicle.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        gender = le_gender.transform([data["gender"]])[0]
        vehicle_type = le_vehicle.transform([data["vehicleType"]])[0]

        df = pd.DataFrame([{
            "age": data["age"],
            "gender": gender,
            "vehicle_age": data["vehicleAge"],
            "vehicle_type": vehicle_type,
            "annual_premium": data["annualPremium"],
            "driving_experience": data["drivingExperience"],
            "accident_history": data["accidentHistory"],
            "claim_history": data["claimHistory"],
            "credit_score": data["creditScore"],
            "policy_duration": data["policyDuration"]
        }])

        scaled = scaler.transform(df)

        prediction = int(model.predict(scaled)[0])
        probability = float(model.predict_proba(scaled)[0][1]) * 100

        return jsonify({
            "prediction": prediction,
            "probability": round(probability, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)