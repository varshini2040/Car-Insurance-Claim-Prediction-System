from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load("best_insurance_model.pkl")
scaler = joblib.load("scaler.pkl")

gender_encoder = joblib.load("label_encoder_gender.pkl")
vehicle_encoder = joblib.load("label_encoder_vehicle.pkl")


@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    gender = gender_encoder.transform([data['gender']])[0]
    vehicle_type = vehicle_encoder.transform([data['vehicle_type']])[0]

    features = [[
        float(data['age']),
        gender,
        float(data['vehicle_age']),
        vehicle_type,
        float(data['annual_premium']),
        float(data['driving_experience']),
        float(data['accident_history']),
        float(data['claim_history']),
        float(data['credit_score']),
        float(data['policy_duration'])
    ]]

    features = scaler.transform(features)

    prediction = int(model.predict(features)[0])

    return jsonify({
        "prediction": prediction,
        "result": "Claim Approved" if prediction == 1 else "Claim Rejected"
    })


if __name__ == "__main__":
    app.run(port=5001)