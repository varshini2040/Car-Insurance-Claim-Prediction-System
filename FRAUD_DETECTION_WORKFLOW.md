# 🔍 Fraud Detection Workflow - Complete Integration

## 📋 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER SIDE (Port 3000)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1️⃣  USER LOGIN                                                  │
│     └─ Sign in with credentials                                 │
│                                                                   │
│  2️⃣  APPLY INSURANCE                                             │
│     └─ Fill insurance application form                           │
│     └─ Save policyNumber & licensePlate to DB & localStorage    │
│                                                                   │
│  3️⃣  SUBMIT CLAIM                                                │
│     └─ Go to "Predict" section                                   │
│     └─ Fill claim details (10 ML features auto-collected)        │
│     └─ System calls ML API immediately                           │
│     └─ Fraud prediction stored in MongoDB                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN SIDE (Port 3000)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  4️⃣  ADMIN LOGIN                                                 │
│     └─ Sign in with admin credentials                           │
│                                                                   │
│  5️⃣  VIEW CLAIM APPLICATIONS                                     │
│     └─ Go to Admin Dashboard → Claims                           │
│     └─ See all submitted claims in table                        │
│     └─ View policy number, amount, current prediction           │
│                                                                   │
│  6️⃣  CLICK DETECT BUTTON                                         │
│     └─ System sends claim features to ML API                    │
│     └─ Fresh fraud detection performed                          │
│     └─ Results displayed in beautiful card                      │
│                                                                   │
│  7️⃣  RESULT SHOWS (IN UI, NOT TERMINAL)                          │
│     ✅ Prediction: Legitimate OR Fraud                           │
│     ✅ Fraud Probability: XX.XX%                                 │
│     ✅ Risk Level: Low / Medium / High                           │
│     ✅ Model Used: RandomForest                                  │
│     ✅ Customer details                                          │
│     ✅ Claim details                                             │
│     ✅ History info (accidents, previous claims)                 │
│                                                                   │
│  8️⃣  ADMIN APPROVES/REJECTS                                      │
│     └─ Click Approve or Reject button                           │
│     └─ Status updates in DB                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Architecture

### Three Services Running:

```
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE 1: React Frontend                       │
│                     Port: 3000                                   │
│  - User & Admin UI (AdminClaims.js)                             │
│  - Displays detection results                                   │
│  - Makes HTTP requests to Node backend                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                SERVICE 2: Node.js Backend                        │
│                     Port: 5000                                   │
│  - Express API server                                            │
│  - Endpoint: POST /api/claims/predict                           │
│  - Forwards requests to Flask ML API                            │
│  - Stores results in MongoDB                                    │
│  - Returns fraud prediction details                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                SERVICE 3: Flask ML API                           │
│                     Port: 5001                                   │
│  - Python Flask server                                          │
│  - Endpoint: POST /predict                                      │
│  - Loads RandomForest model                                     │
│  - Performs fraud detection                                     │
│  - Returns probability, risk level, predictions                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 DATABASE: MongoDB                                │
│  - Stores User, Claim, Insurance data                           │
│  - Saves fraudProbability, fraudRisk, predictionResult          │
│  - Retrieves claim history for analysis                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 10 ML Features Collected

When user submits a claim, these features are sent to ML model:

| # | Feature | Source | Example |
|---|---------|--------|---------|
| 1 | age | User profile | 35 |
| 2 | gender | User profile | Male/Female |
| 3 | vehicle_age | Claim form | 5 (years) |
| 4 | vehicle_type | Claim form | Sedan/SUV |
| 5 | annual_premium | Insurance app | 50000 |
| 6 | driving_experience | Claim form | 10 (years) |
| 7 | accident_history | Claim form | 1 (previous accidents) |
| 8 | claim_history | Claim form | 0 (previous claims) |
| 9 | credit_score | Claim form | 750 |
| 10 | policy_duration | Claim form | 2 (years) |

---

## 🔄 API Flow

### 1. User Submits Claim (Automatic Detection)

```javascript
POST /api/claims/submit
{
  userId: "user123",
  policyNumber: "POL-2026-001",
  licensePlate: "KA01AB1234",
  age: 35,
  gender: "Male",
  vehicleAge: 5,
  vehicleType: "Sedan",
  annualPremium: 50000,
  drivingExperience: 10,
  accidentHistory: 1,
  claimHistory: 0,
  creditScore: 750,
  policyDuration: 2,
  claimAmount: 75000,
  damageType: "Collision"
}
```

**Response:**
```javascript
{
  success: true,
  prediction: 0,  // 0=Legitimate, 1=Fraud
  fraudProbability: 0.15,  // 15% fraud risk
  riskLevel: "Low",
  modelUsed: "RandomForest"
}
```

---

### 2. Admin Clicks Detect (On-Demand Detection)

**Frontend Request:**
```javascript
POST /api/claims/predict
{
  userId: "user123",
  claimId: "claim456",
  age: 35,
  gender: "Male",
  vehicleAge: 5,
  // ... all 10 features
}
```

**Backend Processing:**
```javascript
1. Receive request from React (AdminClaims)
2. Map features to ML format
3. Send to Flask API: http://127.0.0.1:5001/predict
4. Receive ML response with fraud probability
5. Update MongoDB Claim document
6. Return detailed results to React UI
```

**Backend Response:**
```javascript
{
  success: true,
  prediction: 0,
  fraudProbability: 0.15,
  riskLevel: "Low",
  modelUsed: "RandomForest",
  allPredictions: { 0: "Legitimate", 1: "Fraud" },
  probabilities: [0.85, 0.15]  // [Legitimate%, Fraud%]
}
```

**React Displays:**
```
┌──────────────────────────────────────┐
│          ✔ LEGITIMATE                │
│                                       │
│   Fraud Probability: 15.00%          │
│   Risk Level: Low                    │
│   Model Used: RandomForest           │
│                                       │
│   Customer: John Doe                 │
│   Vehicle: KA01AB1234                │
│   Claim Amount: ₹75,000              │
│                                       │
│   Accident History: 1                │
│   Claim History: 0                   │
│   Credit Score: 750                  │
│                                       │
│   ✓ Process the Claim - Low Risk     │
└──────────────────────────────────────┘
```

---

## 📂 Files Updated

### Backend:
- ✅ `backend/routes/ClaimRoutes.js` - Added `/api/claims/predict` endpoint
- ✅ `backend/controllers/predictController.js` - Handles ML prediction
- ✅ `backend/models/Claim.js` - Stores fraud detection results

### Frontend:
- ✅ `src/pages/AdminClaims.js` - Updated to display ML results
  - `handleDetect()` calls ML API
  - Result card shows fraud probability, risk level
  - Color-coded results (Green=Legitimate, Red=Fraud)

### ML/Python:
- ✅ `ml_api/app.py` - Flask API at port 5001
- ✅ `ml_api/health_check.py` - Validates models ✅ PASSING
- ✅ `ml_api/requirements.txt` - numpy==1.26.4 ✅ FIXED

---

## 🚀 How to Start & Test

### Step 1: Start Flask ML API
```powershell
cd e:\PROJECTS\car\ml_api
python app.py

# Expected output:
# ✅ All required models loaded successfully!
# 🌐 Starting Flask API on http://127.0.0.1:5001
```

### Step 2: Start Node Backend
```powershell
cd e:\PROJECTS\car\backend
npm start

# Expected output:
# Server running on port 5000
```

### Step 3: Start React Frontend
```powershell
cd e:\PROJECTS\car
npm start

# Expected output:
# Compiled successfully!
# Local: http://localhost:3000
```

---

## 🧪 Testing Workflow

### Test as User:

1. **Go to**: http://localhost:3000
2. **Sign Up** with credentials:
   - Email: user@test.com
   - Password: password123
3. **Apply Insurance**:
   - Fill all fields
   - Submit → Saves policyNumber & licensePlate
4. **Submit Claim**:
   - Go to Predict section
   - Fill claim details
   - Click Submit
   - **ML API processes automatically**
   - See prediction result in page

### Test as Admin:

1. **Sign Up as Admin**:
   - Admin registration (if available)
   - Or use existing admin account
2. **Go to**: Admin Dashboard → Claims
3. **See Claims Table**:
   - User names
   - Vehicle numbers
   - Claim amounts
   - **Current predictions** (from user submission)
4. **Click "Detect" Button**:
   - Modal/Card appears
   - Shows:
     - ✅ **Prediction** (Legitimate/Fraud)
     - ✅ **Fraud Probability %**
     - ✅ **Risk Level** (Low/Medium/High)
     - ✅ **Model Used** (RandomForest)
     - ✅ **Customer Details**
     - ✅ **Claim History**
5. **Click Approve/Reject**:
   - Claim status updates
   - Stored in MongoDB

---

## ✅ Result Display Details

### Legitimate Claim (Green Card):
```
┌─────────────────────────────────┐
│ ✔ LEGITIMATE                    │
│ Fraud Probability: 15.00%       │
│ This claim is considered low... │
│                                 │
│ Customer: John Doe              │
│ Vehicle: KA01AB1234             │
│ Claim Amount: ₹75,000           │
│                                 │
│ Risk Level: Low                 │
│ Model Used: RandomForest        │
│ Accident History: 1             │
│ Claim History: 0                │
│ Credit Score: 750               │
│                                 │
│ ✓ Process the Claim - Low Risk  │
└─────────────────────────────────┘
```

### Fraudulent Claim (Red Card):
```
┌─────────────────────────────────┐
│ ⚠ FRAUD                         │
│ Fraud Probability: 85.00%       │
│ This claim is flagged as h...   │
│                                 │
│ Customer: Jane Smith            │
│ Vehicle: KA01XY5678             │
│ Claim Amount: ₹500,000          │
│                                 │
│ Risk Level: High                │
│ Model Used: RandomForest        │
│ Accident History: 5             │
│ Claim History: 3                │
│ Credit Score: 450               │
│                                 │
│ ✗ Investigate Carefully - High  │
└─────────────────────────────────┘
```

---

## 📊 Expected ML Results

### Low Risk (Likely Legitimate):
- Fraud Probability: 0-30%
- Card color: 🟢 Green
- Recommendation: Process quickly

### Medium Risk (Needs Review):
- Fraud Probability: 30-70%
- Card color: 🟠 Orange
- Recommendation: Manual investigation

### High Risk (Likely Fraud):
- Fraud Probability: 70-100%
- Card color: 🔴 Red
- Recommendation: Investigate thoroughly

---

## 🔗 Data Flow Summary

```
User fills claim form
    ↓
Submit button clicked
    ↓
Backend /api/claims/submit called
    ↓
Features sent to Flask ML API
    ↓
RandomForest model predicts
    ↓
Fraud probability calculated
    ↓
Result stored in MongoDB
    ↓
Response sent to user page
    ↓
User sees prediction ✅

Later:
Admin logs in
    ↓
Sees all claims in table
    ↓
Clicks Detect on specific claim
    ↓
Backend /api/claims/predict called
    ↓
Fresh prediction from ML API
    ↓
Result card displayed with:
  - Prediction (Fraud/Legitimate)
  - Fraud Probability %
  - Risk Level
  - Model info
  - Customer details ✅
    ↓
Admin can Approve/Reject ✅
```

---

## 🎯 Key Points

✅ **No More Terminal Results**: Everything shows in beautiful UI  
✅ **Real-time Detection**: Click "Detect" → Get instant results  
✅ **Complete Integration**: All 10 ML features included  
✅ **Beautiful UI**: Color-coded results with details  
✅ **MongoDB Storage**: All results saved for history  
✅ **Admin Dashboard**: Centralized view for all claims  
✅ **User-friendly**: Non-technical users can use easily  

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "ML API is not running" | Start Flask: `python app.py` in ml_api folder |
| Result not showing | Check browser console for errors |
| Detection button not working | Make sure Node backend is running on 5000 |
| Permission denied error | Check MongoDB connection string |
| Feature not found error | Ensure all 10 features are in claim form |

---

## 📞 Support

All three services must be running:
1. Flask (5001) - ML predictions
2. Node (5000) - API handling  
3. React (3000) - User interface
4. MongoDB - Database

**Start all at once:**
```bash
cd e:\PROJECTS\car
.\START_ALL.bat
```

✨ **System is ready for production testing!**
