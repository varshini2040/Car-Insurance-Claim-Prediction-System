# 🚗 ML Model Integration - FINAL SETUP GUIDE

## ✅ Your Configuration

### Models Ready ✅
```
E:\PROJECTS\car\ml_api\
├── best_insurance_model.pkl          ✅ RandomForestClassifier
├── scaler.pkl                         ✅ StandardScaler  
├── label_encoder_gender.pkl           ✅ LabelEncoder
├── label_encoder_vehicle.pkl          ✅ LabelEncoder
├── app.py                             ✅ Flask API
├── requirements.txt                   ✅ Dependencies
├── health_check.py                    ✅ Validator
└── diagnostic.py                      ✅ Troubleshooter
```

### Important Discovery 🔍
Your models were **saved with JOBLIB**, not pickle! 
- All files are now configured to use `joblib.load()`
- Updated `app.py` to handle joblib format
- Health check passes ✅

---

## 📋 Setup Checklist

### Step 1: Install Python Dependencies ✅

```powershell
cd E:\PROJECTS\car\ml_api
pip install -r requirements.txt
```

**Key packages:**
- flask==2.3.2
- scikit-learn==1.6.1 (matches your training version)
- joblib==1.3.2 (for loading your models)
- pandas, numpy

### Step 2: Verify Models Load ✅

```powershell
cd E:\PROJECTS\car\ml_api
python health_check.py
```

Expected output:
```
✅ best_insurance_model.pkl [OK] - Type: RandomForestClassifier
✅ scaler.pkl [OK] - Type: StandardScaler
✅ label_encoder_gender.pkl [OK] - Type: LabelEncoder
✅ label_encoder_vehicle.pkl [OK] - Type: LabelEncoder
✅ All required models are present and loadable!
```

---

## 🚀 QUICK START

### Option 1: Automatic Startup (Recommended)

**Windows Batch:**
```powershell
cd E:\PROJECTS\car
.\START_ALL.bat
```

**PowerShell:**
```powershell
cd E:\PROJECTS\car
.\START_ALL.ps1
```

This opens 3 terminals automatically:
1. Flask ML API (port 5001)
2. Node.js Backend (port 5000)
3. React Frontend (port 3000)

### Option 2: Manual Startup (3 terminals)

**Terminal 1 - Flask ML API:**
```powershell
cd E:\PROJECTS\car\ml_api
python app.py
```

**Terminal 2 - Node.js Backend:**
```powershell
cd E:\PROJECTS\car\backend
npm start
```

**Terminal 3 - React Frontend:**
```powershell
cd E:\PROJECTS\car
npm start
```

---

## 🧪 Testing the Integration

### Expected Logs When Starting

**Flask App (Terminal 1):**
```
📊 Loading Insurance Prediction Models (JOBLIB)...
--------------------------------------------------
✅ Loaded: best_insurance_model.pkl
   Model Type: RandomForestClassifier
✅ Loaded: scaler.pkl
   Scaler Type: StandardScaler
✅ Loaded: label_encoder_gender.pkl
   Encoder Type: LabelEncoder
✅ Loaded: label_encoder_vehicle.pkl
   Encoder Type: LabelEncoder
--------------------------------------------------
✅ All required models loaded successfully!

🌐 Starting Flask API on http://127.0.0.1:5001
```

**Backend Connection Check:**
```
[Backend] Connected to ML API on port 5001
[Backend] Ready to forward predictions
```

### Manual API Test (Using PowerShell)

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

$response = Invoke-WebRequest -Uri "http://127.0.0.1:5001/predict" `
  -Method POST `
  -Headers $headers `
  -Body $body

Write-Host "Response:" -ForegroundColor Green
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "success": true,
  "prediction": 0,
  "prediction_label": "Legitimate",
  "fraud_probability": 22.5,
  "risk_level": "🟢 Low Risk - Likely Legitimate",
  "model_used": "best_insurance_model"
}
```

---

## 🎯 Full Workflow

```
1. User opens app at http://localhost:3000
   ↓
2. User applies for insurance
   → Policy number generated & saved
   ↓
3. User logs out and back in
   → Policy number & license plate pre-filled
   ↓
4. User goes to Predict section & fills claim form
   ↓
5. User submits claim with all 10 features:
   - age, gender, vehicle_age, vehicle_type
   - annual_premium, driving_experience
   - accident_history, claim_history
   - credit_score, policy_duration
   ↓
6. Frontend → Node.js Backend → Flask ML API
   ↓
7. Flask loads models & makes prediction using:
   - RandomForestClassifier (best_insurance_model.pkl)
   - StandardScaler for feature scaling
   - LabelEncoders for categorical variables
   ↓
8. Returns: prediction (0/1), probability, risk level
   ↓
9. Backend saves to MongoDB with prediction
   ↓
10. Frontend displays: "Fraud" or "Legitimate" with probability
```

---

## 📊 Response Structure

### Successful Prediction

```json
{
  "success": true,
  "prediction": 0,                           // 0=Legitimate, 1=Fraud
  "prediction_label": "Legitimate",
  "fraud_probability": 22.5,                 // 0-100%
  "legitimate_probability": 77.5,
  "risk_level": "🟢 Low Risk - Likely Legitimate",
  "model_used": "best_insurance_model",
  "input_features": {
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
}
```

### Risk Level Interpretation

| Risk Level | Fraud Probability | Color |
|-----------|------------------|-------|
| Low Risk | < 40% | 🟢 Green |
| Medium Risk | 40-70% | 🟡 Yellow |
| High Risk | > 70% | 🔴 Red |

---

## 🐛 Troubleshooting

### Issue: "Connection refused on port 5001"
```
Solution: 
1. Make sure Flask is running: python app.py
2. Check port isn't in use: netstat -ano | findstr :5001
3. Kill process if needed: taskkill /PID <pid> /F
```

### Issue: "Model not loaded"
```
Solution:
1. Run health check: python health_check.py
2. Verify all pkl files exist
3. Check Python version: python --version (should be 3.11)
4. Reinstall requirements: pip install -r requirements.txt --upgrade
```

### Issue: "invalid load key" error
```
Solution: This means pickle is being used instead of joblib
✅ FIXED - app.py now uses joblib.load()
If you still see this, clear your Python cache:
- Delete __pycache__ folders
- Restart Python
```

### Issue: "STACK_GLOBAL requires str" error
```
Solution: Sklearn version mismatch
✅ FIXED - requirements.txt now has scikit-learn==1.6.1
If you still see this:
pip install scikit-learn==1.6.1 --force-reinstall
```

---

## 📈 Model Information

### Model Details
- **Type**: RandomForestClassifier
- **Framework**: scikit-learn 1.6.1
- **Training Date**: 2026-06-17
- **Features**: 10 (numeric + categorical)
- **Preprocessing**: StandardScaler + LabelEncoding
- **Output**: Binary classification (Fraud/Legitimate)

### Expected Behavior
- Fast predictions (< 100ms)
- Probability confidence 0-100%
- Handles missing values gracefully
- Categorical features auto-encoded

---

## ✨ Next Steps

1. ✅ Health check passes
2. ✅ All files in correct location
3. ✅ Dependencies installed
4. 🔄 Run START_ALL.bat or START_ALL.ps1
5. 🔄 Test by submitting a claim
6. 📊 Check MongoDB for prediction results

---

## 📞 Quick Reference Commands

```powershell
# Start everything
cd E:\PROJECTS\car
.\START_ALL.ps1

# Check model health
cd E:\PROJECTS\car\ml_api
python health_check.py

# Diagnose issues
cd E:\PROJECTS\car\ml_api
python diagnostic.py

# Install dependencies
cd E:\PROJECTS\car\ml_api
pip install -r requirements.txt

# Test Flask directly
cd E:\PROJECTS\car\ml_api
python app.py
# Then in another terminal: Invoke-WebRequest http://127.0.0.1:5001/health
```

---

**🎉 Your ML model is ready to predict insurance claim fraud!**
