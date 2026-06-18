"""
ML API for Car Insurance Claim Prediction
Loads joblib models and serves predictions via Flask
Uses: best_insurance_model.pkl, label_encoder_gender.pkl, 
      label_encoder_vehicle.pkl, scaler.pkl
Models were saved with JOBLIB, not pickle!
"""

import joblib
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ================================
# LOAD MODELS ON STARTUP
# ================================
model = None
scaler = None
label_encoder_gender = None
label_encoder_vehicle = None

def load_models():
    """Load all joblib files for insurance prediction"""
    global model, scaler, label_encoder_gender, label_encoder_vehicle
    
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        print("\n📊 Loading Insurance Prediction Models (JOBLIB)...")
        print("-" * 50)
        
        # Load main model
        model_path = os.path.join(current_dir, 'best_insurance_model.pkl')
        if os.path.exists(model_path):
            try:
                model = joblib.load(model_path)
                print(f"✅ Loaded: best_insurance_model.pkl")
                print(f"   Model Type: {type(model).__name__}")
            except Exception as e:
                print(f"❌ ERROR loading model: {e}")
                return False
        else:
            print(f"❌ ERROR: best_insurance_model.pkl not found!")
            return False
        
        # Load scaler
        scaler_path = os.path.join(current_dir, 'scaler.pkl')
        if os.path.exists(scaler_path):
            try:
                scaler = joblib.load(scaler_path)
                print(f"✅ Loaded: scaler.pkl")
                print(f"   Scaler Type: {type(scaler).__name__}")
            except Exception as e:
                print(f"⚠️  WARNING: Could not load scaler.pkl: {e}")
        else:
            print(f"⚠️  WARNING: scaler.pkl not found (feature scaling disabled)")
        
        # Load label encoder for gender
        gender_encoder_path = os.path.join(current_dir, 'label_encoder_gender.pkl')
        if os.path.exists(gender_encoder_path):
            try:
                label_encoder_gender = joblib.load(gender_encoder_path)
                print(f"✅ Loaded: label_encoder_gender.pkl")
                print(f"   Encoder Type: {type(label_encoder_gender).__name__}")
            except Exception as e:
                print(f"⚠️  WARNING: Could not load label_encoder_gender.pkl: {e}")
        else:
            print(f"⚠️  WARNING: label_encoder_gender.pkl not found")
        
        # Load label encoder for vehicle type
        vehicle_encoder_path = os.path.join(current_dir, 'label_encoder_vehicle.pkl')
        if os.path.exists(vehicle_encoder_path):
            try:
                label_encoder_vehicle = joblib.load(vehicle_encoder_path)
                print(f"✅ Loaded: label_encoder_vehicle.pkl")
                print(f"   Encoder Type: {type(label_encoder_vehicle).__name__}")
            except Exception as e:
                print(f"⚠️  WARNING: Could not load label_encoder_vehicle.pkl: {e}")
        else:
            print(f"⚠️  WARNING: label_encoder_vehicle.pkl not found")
        
        print("-" * 50)
        print(f"✅ All required models loaded successfully!\n")
        return True
            
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False

# ================================
# FEATURE PREPROCESSING
# ================================
def preprocess_features(data):
    """Preprocess and prepare features for prediction"""
    try:
        # Map input features - exactly as model expects
        features = {
            'age': float(data.get('age', 0)),
            'gender': data.get('gender', 'Male'),  # Will be encoded
            'vehicle_age': float(data.get('vehicle_age', 0)),
            'vehicle_type': data.get('vehicle_type', 'Sedan'),  # Will be encoded
            'annual_premium': float(data.get('annual_premium', 0)),
            'driving_experience': float(data.get('driving_experience', 0)),
            'accident_history': float(data.get('accident_history', 0)),
            'claim_history': float(data.get('claim_history', 0)),
            'credit_score': float(data.get('credit_score', 600)),
            'policy_duration': float(data.get('policy_duration', 0))
        }
        
        print(f"✅ Features preprocessed: {list(features.keys())}")
        return features
    except Exception as e:
        print(f"❌ Error preprocessing features: {e}")
        return None

# ================================
# ENCODE CATEGORICAL VARIABLES
# ================================
def encode_categoricals(features):
    """Encode categorical variables using loaded encoders"""
    try:
        # Encode gender
        if label_encoder_gender:
            try:
                gender_encoded = label_encoder_gender.transform([features['gender']])[0]
                features['gender_encoded'] = int(gender_encoded)
                print(f"✅ Encoded gender '{features['gender']}' → {gender_encoded}")
            except Exception as e:
                print(f"⚠️  Could not encode gender: {e}")
                # Fallback
                features['gender_encoded'] = 1 if features['gender'].lower() in ['male', 'm'] else 0
        else:
            # Fallback encoding
            features['gender_encoded'] = 1 if features['gender'].lower() in ['male', 'm'] else 0
            print(f"⚠️  Using fallback gender encoding")
        
        # Encode vehicle type
        if label_encoder_vehicle:
            try:
                vehicle_encoded = label_encoder_vehicle.transform([features['vehicle_type']])[0]
                features['vehicle_type_encoded'] = int(vehicle_encoded)
                print(f"✅ Encoded vehicle type '{features['vehicle_type']}' → {vehicle_encoded}")
            except Exception as e:
                print(f"⚠️  Could not encode vehicle type: {e}")
                # Fallback
                vehicle_map = {'sedan': 0, 'suv': 1, 'hatchback': 2, 'truck': 3, 'coupe': 4}
                features['vehicle_type_encoded'] = vehicle_map.get(features['vehicle_type'].lower(), 0)
        else:
            # Fallback encoding
            vehicle_map = {'sedan': 0, 'suv': 1, 'hatchback': 2, 'truck': 3, 'coupe': 4}
            features['vehicle_type_encoded'] = vehicle_map.get(features['vehicle_type'].lower(), 0)
            print(f"⚠️  Using fallback vehicle type encoding")
        
        return features
    except Exception as e:
        print(f"❌ Error encoding categoricals: {e}")
        return features

# ================================
# PREDICTION ENDPOINT
# ================================
@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Preprocess features
        features = preprocess_features(data)
        if not features:
            return jsonify({
                'success': False,
                'error': 'Feature preprocessing failed'
            }), 400
        
        # Encode categoricals
        features = encode_categoricals(features)
        
        # Prepare feature array (order matters!)
        # Adjust this order based on your model's training feature order
        feature_order = [
            'age', 'vehicle_age', 'annual_premium', 'driving_experience',
            'accident_history', 'claim_history', 'credit_score', 'policy_duration',
            'gender_encoded', 'vehicle_type_encoded'
        ]
        
        X = np.array([[features.get(feat, 0) for feat in feature_order]])
        
        print(f"📊 Input features shape: {X.shape}")
        print(f"📊 Input values: {X[0]}")
        
        # Scale features if scaler available
        if scaler:
            X_scaled = scaler.transform(X)
            print(f"✅ Features scaled")
            X_to_predict = X_scaled
        else:
            X_to_predict = X
            print(f"⚠️  Features not scaled (scaler not available)")
        
        # Make prediction
        try:
            prediction = model.predict(X_to_predict)[0]
            print(f"✅ Prediction made: {prediction}")
            
            # Get probability if available
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(X_to_predict)[0]
                fraud_prob = float(proba[1]) if len(proba) > 1 else float(prediction)
                legitimate_prob = float(proba[0]) if len(proba) > 1 else float(1 - prediction)
                print(f"✅ Fraud probability: {fraud_prob*100:.2f}%")
            else:
                fraud_prob = float(prediction)
                legitimate_prob = float(1 - prediction)
                print(f"⚠️  No probability available (using raw prediction)")
        except Exception as e:
            print(f"❌ Model prediction error: {e}")
            return jsonify({
                'success': False,
                'error': f'Prediction failed: {str(e)}'
            }), 500
        
        # Determine risk level
        fraud_percentage = fraud_prob * 100
        if fraud_percentage >= 70:
            risk_level = "🔴 High Risk - Likely Fraud"
        elif fraud_percentage >= 40:
            risk_level = "🟡 Medium Risk - Suspected Fraud"
        else:
            risk_level = "🟢 Low Risk - Likely Legitimate"
        
        # Prepare response
        response = {
            'success': True,
            'prediction': int(prediction),
            'prediction_label': 'Fraud' if prediction == 1 else 'Legitimate',
            'fraud_probability': round(fraud_percentage, 2),
            'legitimate_probability': round(legitimate_prob * 100, 2),
            'risk_level': risk_level,
            'model_used': 'best_insurance_model',
            'input_features': {
                'age': features.get('age'),
                'gender': features.get('gender'),
                'vehicle_age': features.get('vehicle_age'),
                'vehicle_type': features.get('vehicle_type'),
                'annual_premium': features.get('annual_premium'),
                'driving_experience': features.get('driving_experience'),
                'accident_history': features.get('accident_history'),
                'claim_history': features.get('claim_history'),
                'credit_score': features.get('credit_score'),
                'policy_duration': features.get('policy_duration')
            }
        }
        
        print(f"✅ Response prepared: {response['prediction_label']}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ================================
# HEALTH CHECK
# ================================
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'models_loaded': len(models),
        'available_models': list(models.keys())
    })

# ================================
# STARTUP
# ================================
if __name__ == '__main__':
    print("🚀 Loading ML Models...")
    models_loaded = load_models()
    
    if not models_loaded:
        print("⚠️  Warning: No models loaded. Predictions may fail.")
    
    print("\n🌐 Starting Flask API on http://127.0.0.1:5001")
    app.run(debug=True, port=5001, host='127.0.0.1')
