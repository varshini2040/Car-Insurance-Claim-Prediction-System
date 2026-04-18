# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables for models
models = {}
scaler = None
feature_names = []

def load_models():
    """Load pre-trained models"""
    global models, scaler, feature_names
    
    try:
        models = {
            'random_forest': joblib.load('models/random_forest_model.pkl'),
            'xgboost': joblib.load('models/xgboost_model.pkl'),
            'logistic_regression': joblib.load('models/logistic_regression_model.pkl')
        }
        scaler = joblib.load('models/scaler.pkl')
        feature_names = joblib.load('models/feature_names.pkl')
        print("✅ Models loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False

def init_db():
    """Initialize SQLite database for storing predictions"""
    conn = sqlite3.connect('predictions.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS predictions
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  age INTEGER,
                  gender TEXT,
                  car_age INTEGER,
                  premium REAL,
                  claims_history INTEGER,
                  vehicle_type TEXT,
                  prediction REAL,
                  risk_level TEXT,
                  model_used TEXT,
                  timestamp DATETIME)''')
    conn.commit()
    conn.close()
    print("✅ Database initialized!")

def save_prediction(data, prediction, risk_level, model_used):
    """Save prediction to database"""
    conn = sqlite3.connect('predictions.db')
    c = conn.cursor()
    c.execute('''INSERT INTO predictions 
                 (age, gender, car_age, premium, claims_history, vehicle_type, 
                  prediction, risk_level, model_used, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (data['age'], data['gender'], data['car_age'], data['premium'],
               data['claims_history'], data['vehicle_type'], prediction,
               risk_level, model_used, datetime.now()))
    conn.commit()
    conn.close()

def get_prediction_stats():
    """Get statistics for dashboard"""
    conn = sqlite3.connect('predictions.db')
    c = conn.cursor()
    
    # Total predictions
    c.execute("SELECT COUNT(*) FROM predictions")
    total_predictions = c.fetchone()[0] or 0
    
    # Risk level distribution
    c.execute("SELECT risk_level, COUNT(*) FROM predictions GROUP BY risk_level")
    risk_distribution = dict(c.fetchall())
    
    # Recent predictions
    c.execute("SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 10")
    recent_predictions = c.fetchall()
    
    conn.close()
    
    return {
        'total_predictions': total_predictions,
        'risk_distribution': risk_distribution,
        'recent_predictions': recent_predictions
    }

# Load models when app starts
if not load_models():
    print("Please run model_training.py first!")
    exit(1)

init_db()

@app.route('/')
def home():
    return jsonify({"message": "Car Insurance Prediction API is running!"})

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Prepare features for prediction
        features_df = pd.DataFrame([data])
        
        # One-hot encoding
        features_encoded = pd.get_dummies(features_df, columns=['gender', 'vehicle_type'])
        
        # Ensure all expected features are present
        for feature in feature_names:
            if feature not in features_encoded.columns:
                features_encoded[feature] = 0
        
        # Reorder columns to match training data
        features_encoded = features_encoded[feature_names]
        
        # Scale features
        features_scaled = scaler.transform(features_encoded)
        
        # Make predictions with selected model
        model_used = data.get('model', 'random_forest')
        model = models.get(model_used, models['random_forest'])
        
        if hasattr(model, 'predict_proba'):
            prediction_prob = model.predict_proba(features_scaled)[0][1]
        else:
            prediction_prob = model.predict(features_scaled)[0]
        
        # Determine risk level
        if prediction_prob < 0.3:
            risk_level = "Low Risk"
        elif prediction_prob < 0.7:
            risk_level = "Medium Risk"
        else:
            risk_level = "High Risk"
        
        # Save prediction to database
        save_prediction(data, float(prediction_prob), risk_level, model_used)
        
        return jsonify({
            'success': True,
            'probability': float(prediction_prob),
            'risk_level': risk_level,
            'model_used': model_used
        })
        
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 400

@app.route('/api/dashboard-data', methods=['GET'])
def dashboard_data():
    stats = get_prediction_stats()
    return jsonify(stats)

if __name__ == '__main__':
    print("🚀 Starting Car Insurance Prediction API...")
    print("📊 API running at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)