# 🚗 ML Model Integration Verification Guide

## ✅ Current Integration Status

### Components Connected:
- **Frontend (React)** → Port 3000
  - AdminClaims.js uses `/api/claims/predict` endpoint
  
- **Backend (Node.js)** → Port 5000
  - Routes: `/api/claims/predict` ← **[FIXED: Changed from /api/Claims]**
  - Forwards to Flask API on port 5001
  - Maps response fields: snake_case → camelCase
  
- **ML API (Flask)** → Port 5001
  - Loads models: best_insurance_model.pkl
  - Encoders: label_encoder_gender.pkl, label_encoder_vehicle.pkl
  - Scaler: scaler.pkl

---

## 🚀 Startup Instructions

### Option 1: Automatic Startup (Recommended)
```batch
cd e:\PROJECTS\car
.\START_ALL.bat
```
This opens 3 terminals automatically for all services.

### Option 2: Manual Startup (Terminal by Terminal)

**Terminal 1 - Flask ML API:**
```bash
cd e:\PROJECTS\car\ml_api
pip install -r requirements.txt  # First time only
python app.py
```
✅ Expected output: `Loading Insurance Prediction Models (JOBLIB)...`

**Terminal 2 - Node Backend:**
```bash
cd e:\PROJECTS\car\backend
npm install  # First time only
npm start
```
✅ Expected output: `✔ Server running on port 5000`

**Terminal 3 - React Frontend:**
```bash
cd e:\PROJECTS\car
npm install  # First time only
npm start
```
✅ Expected output: `webpack compiled successfully`

---

## 🧪 Integration Testing

### Test 1: Flask ML API Health
```bash
curl http://127.0.0.1:5001/health
```
✅ Should return: `{"status": "ok", ...}`

### Test 2: Direct ML Prediction
```bash
curl -X POST http://127.0.0.1:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "gender": "Male",
    "vehicle_age": 5,
    "vehicle_type": "Sedan",
    "annual_premium": 50000,
    "driving_experience": 10,
    "accident_history": 1,
    "claim_history": 0,
    "credit_score": 750,
    "policy_duration": 3
  }'
```
✅ Should return: Fraud/Legitimate prediction with probability

### Test 3: Backend API Endpoint
```bash
curl -X POST http://localhost:5000/api/claims/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "gender": "Male",
    "vehicleAge": 5,
    "vehicleType": "Sedan",
    "annualPremium": 50000,
    "drivingExperience": 10,
    "accidentHistory": 1,
    "claimHistory": 0,
    "creditScore": 750,
    "policyDuration": 3,
    "userId": "123",
    "policyNumber": "POL123"
  }'
```
✅ Should return: JSON with camelCase fields

### Test 4: Web UI Integration
1. Open browser → http://localhost:3000
2. Login as Admin
3. Go to "Admin Dashboard" → "Approve Claims"
4. Click "Detect" button on any claim
5. Wait for ML prediction result card to appear

✅ Should show:
- Fraud/Legitimate classification
- Fraud Probability (%)
- Risk Level (Low/Medium/High)
- Model Used (best_insurance_model)

---

## 🔍 Troubleshooting

### Issue: "ML API is not running" Error
**Solution:**
1. Ensure Flask is running on port 5001
2. Check terminal shows: `✅ All required models loaded successfully!`
3. Test with curl: `curl http://127.0.0.1:5001/health`

### Issue: 404 Error on Detect Click
**Solution:** This was **FIXED** - route was `/api/Claims/predict` (uppercase C)
- Backend now uses: `/api/claims/predict` (lowercase)
- Frontend calls: `http://localhost:5000/api/claims/predict` ✓

### Issue: "Model not loaded" in Flask Response
**Solution:**
1. Verify model files exist:
   - `ml_api/best_insurance_model.pkl` ✓
   - `ml_api/label_encoder_gender.pkl` ✓
   - `ml_api/label_encoder_vehicle.pkl` ✓
   - `ml_api/scaler.pkl` ✓

2. Check Flask console for errors
3. Reinstall requirements: `pip install -r requirements.txt`

### Issue: Timeout or Connection Refused
**Solution:**
1. Ensure ports are available:
   - Port 3000 (React)
   - Port 5000 (Node Backend)
   - Port 5001 (Flask ML API)
2. Windows firewall might block port 5001
3. Use `netstat -ano | findstr :5001` to check

### Issue: Different Fraud Probability Results
**Solution:**
The probability is calculated correctly:
- Flask returns: `fraud_probability` (0-100 scale)
- Backend converts to: `fraudProbability` (0-1 scale) by dividing by 100
- Frontend displays: percentage by multiplying by 100 again

---

## 📊 Data Flow Diagram

```
User clicks "Detect" in AdminClaims.js (Port 3000)
    ↓
Sends POST to http://localhost:5000/api/claims/predict
    ↓
Node Backend receives claim data (camelCase)
    ↓
Maps to snake_case and forwards to Flask on port 5001
    ↓
Flask ML API loads models and processes features
    ↓
Returns prediction with fraud_probability (0-100)
    ↓
Backend converts to camelCase (fraudProbability 0-1)
    ↓
Frontend receives and displays in result card
    ↓
Admin sees: Fraud/Legitimate status + Risk Level
```

---

## 🎯 Next Steps

1. **Run START_ALL.bat** to start all services
2. **Test with curl commands** above to verify each layer
3. **Test Web UI** by navigating to Admin Claims page
4. **Monitor console logs** in each terminal for errors
5. **Check MongoDB connection** - ensure database is running

---

## ✨ Integration Complete!

Once you see the prediction result card appear when clicking "Detect", the ML model is **fully integrated** and working! 🎉
