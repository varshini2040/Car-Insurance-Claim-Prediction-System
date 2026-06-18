# 🚗 Car Insurance Claim Prediction - ML Model Integration Guide

## ✅ Setup Complete!

Your MERN stack application is now ready to integrate with ML models for fraud prediction.

---

## 📋 Project Structure

```
backend/
├── ml_api/                    # 🎯 ML Service (New)
│   ├── app.py                # Flask app for predictions
│   ├── requirements.txt       # Python dependencies
│   ├── random_forest_model.pkl
│   ├── best_model.pkl
│   ├── insurance_model.pkl
│   └── claim_prediction_model.pkl
│
├── controllers/
│   ├── claimController.js     # ✅ Updated - calls ML API
│   ├── predictController.js   # ✅ Updated - handles predictions
│   └── insuranceController.js
│
├── models/
│   └── Claim.js               # ✅ Updated - stores fraud probability
│
└── routes/
    └── ClaimRoutes.js         # Routes to submit claims
```

---

## 🔧 SETUP STEPS

### Step 1: Copy Your PKL Files
Place your trained models in the `backend/ml_api/` directory:

```
E:\PROJECTS\car\backend\ml_api\
├── random_forest_model.pkl
├── best_model.pkl
├── insurance_model.pkl
├── claim_prediction_model.pkl
├── scaler.pkl (optional - for feature scaling)
└── label_encoders.pkl (optional - for categorical encoding)
```

**📌 If you have other pkl files like scaler or encoders, add them too!**

---

### Step 2: Install Python Dependencies

Open PowerShell and run:

```powershell
cd E:\PROJECTS\car\backend\ml_api
pip install -r requirements.txt
```

Or if you prefer conda:

```powershell
conda create -n ml-api python=3.9
conda activate ml-api
pip install -r requirements.txt
```

---

### Step 3: Start the Flask ML API Server

**Terminal 1 - ML API (Python):**

```powershell
cd E:\PROJECTS\car\backend\ml_api
python app.py
```

Expected output:
```
🚀 Loading ML Models...
✅ Loaded: random_forest_model.pkl
✅ Loaded: best_model.pkl
✅ Loaded: insurance_model.pkl
✅ Loaded: claim_prediction_model.pkl
✅ Successfully loaded 4 model(s)

🌐 Starting Flask API on http://127.0.0.1:5001
```

---

### Step 4: Start Node.js Backend Server

**Terminal 2 - Node.js Backend:**

```powershell
cd E:\PROJECTS\car\backend
npm start
# OR
node server.js
```

---

### Step 5: Start React Frontend

**Terminal 3 - React Frontend:**

```powershell
cd E:\PROJECTS\car
npm start
```

---

## 🎯 How It Works

### Data Flow:

```
1. User fills form in Predict.js
   ↓
2. Frontend sends to Node.js API (/api/claims/submit)
   ↓
3. Node.js Backend calls claimController.submitClaim()
   ↓
4. Controller calls ML API (http://127.0.0.1:5001/predict)
   ↓
5. Flask loads pkl models → Makes prediction
   ↓
6. Returns: prediction, fraud_probability, risk_level, model_used
   ↓
7. Node.js saves to MongoDB with prediction result
   ↓
8. Frontend receives response with prediction ✅
```

---

## 📊 Input Features Expected by ML Model

The model expects these 10 features:

| Feature | Type | Example | Required |
|---------|------|---------|----------|
| **age** | Number | 35 | ✅ Yes |
| **gender** | String | "Male" / "Female" | ✅ Yes |
| **vehicle_age** | Number | 5 | ✅ Yes |
| **vehicle_type** | String | "Sedan" / "SUV" | ✅ Yes |
| **annual_premium** | Number | 12000 | ✅ Yes |
| **driving_experience** | Number | 10 | ✅ Yes |
| **accident_history** | Number | 0 | ✅ Yes |
| **claim_history** | Number | 1 | ✅ Yes |
| **credit_score** | Number | 750 | ✅ Yes |
| **policy_duration** | Number | 24 | ✅ Yes |

---

## 📤 API Endpoints

### 1. Flask ML API (Port 5001)

**POST** `/predict`

Request:
```json
{
  "age": 35,
  "gender": "Male",
  "vehicle_age": 5,
  "vehicle_type": "Sedan",
  "annual_premium": 12000,
  "driving_experience": 10,
  "accident_history": 0,
  "claim_history": 1,
  "credit_score": 750,
  "policy_duration": 24
}
```

Response:
```json
{
  "success": true,
  "prediction": 0,
  "fraud_probability": 22.5,
  "risk_level": "🟢 Low Risk",
  "model_used": "best_model",
  "all_predictions": {
    "random_forest_model.pkl": 0,
    "best_model.pkl": 0,
    "insurance_model.pkl": 0,
    "claim_prediction_model.pkl": 0
  },
  "probabilities": {
    "random_forest_model.pkl": {
      "fraud": 0.22,
      "legitimate": 0.78
    }
  }
}
```

### 2. Node.js Claims API (Port 5000)

**POST** `/api/claims/submit`

This endpoint automatically:
- Validates input
- Calls ML API
- Saves claim to database
- Returns prediction result

---

## 🐛 Troubleshooting

### Error: "ML API is not running"
```
Solution: Make sure Flask app is running on port 5001
Run: python E:\PROJECTS\car\backend\ml_api\app.py
```

### Error: "No models found!"
```
Solution: Check if pkl files are in correct directory
E:\PROJECTS\car\backend\ml_api\
- Verify file names match exactly
- Check file permissions
```

### Error: "Feature preprocessing failed"
```
Solution: Ensure all 10 required features are sent
Check frontend form values before submission
```

### Error: "ECONNREFUSED"
```
Solution: Flask API not running
Terminal 1: python app.py
OR check if port 5001 is in use
```

---

## 🧪 Test the Integration

### Manual Test with cURL:

```powershell
$headers = @{"Content-Type" = "application/json"}

$body = @{
    age = 35
    gender = "Male"
    vehicle_age = 5
    vehicle_type = "Sedan"
    annual_premium = 12000
    driving_experience = 10
    accident_history = 0
    claim_history = 1
    credit_score = 750
    policy_duration = 24
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://127.0.0.1:5001/predict" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

### Via Browser/Postman:

1. Start Flask API: `python app.py`
2. Open Postman or Insomnia
3. POST to `http://127.0.0.1:5001/predict`
4. Add JSON body with features
5. Send and check response

---

## 📈 Understanding the Response

| Field | Meaning |
|-------|---------|
| **prediction** | 0 = Legitimate, 1 = Fraud |
| **fraud_probability** | % chance of fraud (0-100) |
| **risk_level** | 🟢 Low / 🟡 Medium / 🔴 High |
| **model_used** | Which model made the prediction |
| **all_predictions** | Predictions from all loaded models |

### Risk Level Interpretation:
- 🟢 **Low Risk**: < 40% fraud probability
- 🟡 **Medium Risk**: 40-70% fraud probability  
- 🔴 **High Risk**: > 70% fraud probability

---

## 📁 File Descriptions

### `app.py` - Flask ML API
- Loads all pkl models on startup
- Handles feature preprocessing & encoding
- Makes predictions using multiple models
- Returns probabilities and confidence

### `predictController.js` - Node.js Handler
- Maps frontend data to ML model features
- Calls Flask API
- Handles errors gracefully
- Supports timeout (10 seconds)

### `claimController.js` - Claim Submission
- Validates claim data
- Calls ML prediction
- Saves claim with prediction
- Stores fraud probability

### `Claim.js - MongoDB Schema
- New fields: `fraudProbability`, `modelUsed`
- Stores all ML prediction results
- Tracks which model was used

---

## ✨ Next Steps

1. ✅ Copy pkl files to `backend/ml_api/`
2. ✅ Install Python dependencies
3. ✅ Start Flask API (python app.py)
4. ✅ Start Node.js backend (npm start)
5. ✅ Start React frontend (npm start)
6. ✅ Test by submitting a claim
7. ✅ View prediction results in MongoDB

---

## 🎓 Model Performance Tips

To improve predictions:

1. **Ensure feature scaling**: If your models use scaled features, add `scaler.pkl`
2. **Use label encoders**: If categorical encoding was used, add `label_encoders.pkl`
3. **Check model versions**: Ensure pkl files match training environment
4. **Add logging**: Monitor predictions to identify patterns
5. **Regular retraining**: Update models with new data periodically

---

## 📞 Support

If you encounter issues:

1. Check Flask API logs for errors
2. Check Node.js console for API calls
3. Verify all 10 features are provided
4. Ensure ports 5000 and 5001 are available
5. Check pkl file integrity

---

**🚀 You're all set! Your ML model is now integrated with your MERN stack application!**
