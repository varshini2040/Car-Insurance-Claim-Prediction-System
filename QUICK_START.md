# 🚀 QUICK START GUIDE - Fraud Detection System

## ⚡ 30-Second Setup

### Start All Services (One Command)

**Windows (Recommended):**
```bash
cd e:\PROJECTS\car
.\START_ALL.bat
```

**Alternative - PowerShell:**
```powershell
cd e:\PROJECTS\car
.\START_ALL.ps1
```

**Manual - 3 Separate Terminals:**

```bash
# Terminal 1 - Flask ML API (Port 5001)
cd e:\PROJECTS\car\ml_api
python app.py

# Terminal 2 - Node Backend (Port 5000)
cd e:\PROJECTS\car\backend
npm start

# Terminal 3 - React Frontend (Port 3000)
cd e:\PROJECTS\car
npm start
```

---

## ✅ Verification Checklist

After starting services, verify all are running:

- [ ] Flask API: http://127.0.0.1:5001 (Terminal shows "Running on...")
- [ ] Node Backend: http://localhost:5000 (Terminal shows "listening on port 5000")
- [ ] React App: http://localhost:3000 (Browser opens automatically)

---

## 🧪 Complete Test Workflow (5 Minutes)

### **PART 1: User Side (3 Steps)**

#### Step 1: Sign Up / Login
```
1. Open: http://localhost:3000
2. Click "Sign Up" or "Sign In"
3. Enter credentials:
   - Email: test@insurance.com
   - Password: test@123
   - Name: Test User
4. Click Sign Up/Login
```

#### Step 2: Apply for Insurance
```
1. After login, click "Apply Insurance"
2. Fill all fields:
   - Name: Your Name
   - Age: 35
   - Gender: Male
   - Vehicle Type: Sedan
   - Vehicle Age: 5
   - Annual Premium: 50000
   - Driving Experience: 10
   - Credit Score: 750
3. Click "Submit Application"
4. ✅ See confirmation message
5. ✅ policyNumber & licensePlate saved (check browser console)
```

#### Step 3: Submit Claim for Fraud Detection
```
1. Navigate to "Predict" section
2. You'll see auto-filled fields:
   - Policy Number: (auto-populated)
   - License Plate: (auto-populated)
3. Fill claim details:
   - Accident Date: Select today
   - Accident Location: City name
   - Damage Type: Collision
   - Description: Describe accident
   - Estimated Cost: 75000
   - Accident History: 1
   - Claim History: 0
   - Upload accident image (optional)
4. Click "Submit Claim"
5. ✅ ML API processes automatically
6. ✅ See prediction result displayed:
   - Prediction: Legitimate or Fraud
   - Fraud Probability: XX.XX%
   - Risk Level: Low/Medium/High
```

---

### **PART 2: Admin Side (2 Steps)**

#### Step 4: Admin Login
```
1. Open new tab: http://localhost:3000
2. Clear cache or use incognito window (to logout as user)
3. Sign In as Admin:
   - Email: admin@insurance.com (or your admin account)
   - Password: admin@123 (or your admin password)
4. Navigate to "Admin Dashboard"
```

#### Step 5: View Claims & Click Detect
```
1. Go to: Admin Dashboard → Claims
2. You'll see table with all submitted claims:
   - Customer names
   - Vehicle numbers
   - Claim amounts
   - Current predictions (from Step 3)
3. Find your claim from Step 3
4. Click "Detect" button
5. ✅ Beautiful result card appears showing:

   ┌────────────────────────────────┐
   │    ✔ LEGITIMATE                │
   │    Fraud Probability: 15.00%   │
   │    Risk Level: Low             │
   │    Model: RandomForest         │
   │                                │
   │    Customer: Test User         │
   │    Vehicle: KA01AB1234         │
   │    Claim: ₹75,000              │
   │                                │
   │    Accident History: 1         │
   │    Claim History: 0            │
   │    Credit Score: 750           │
   │                                │
   │    ✓ Process - Low Risk        │
   └────────────────────────────────┘

6. 🎉 ML Detection Result displays in UI (NOT terminal)!
7. Click "Approve" or "Reject" to finalize
```

---

## 📊 What You'll See

### Terminal Output (Flask API):
```
✅ Loaded: best_insurance_model.pkl
✅ Loaded: scaler.pkl
✅ Loaded: label_encoder_gender.pkl
✅ Loaded: label_encoder_vehicle.pkl
✅ All required models loaded successfully!
🌐 Starting Flask API on http://127.0.0.1:5001
```

### Browser UI (React App):

**User sees (after Submit Claim):**
```
✅ Prediction Result
   Fraud Probability: 15.00%
   Risk Level: Low
   Prediction: Legitimate
```

**Admin sees (after Click Detect):**
```
✅ Beautiful Result Card with:
   - Prediction (colored: Green=Legit, Red=Fraud)
   - Fraud Probability percentage
   - Risk Level color-coded
   - Model information
   - Customer & claim details
   - Action recommendation
```

---

## 🔧 Troubleshooting

### Issue: "ML API is not running"
**Solution:**
```bash
cd e:\PROJECTS\car\ml_api
python health_check.py  # Should show all 4 models ✅

# If models not loading:
python app.py  # This starts the Flask server
```

### Issue: "Cannot connect to localhost:5000"
**Solution:**
```bash
# Make sure Node backend is running:
cd e:\PROJECTS\car\backend
npm start

# Check if port 5000 is free:
netstat -ano | findstr :5000
```

### Issue: "Cannot connect to localhost:3000"
**Solution:**
```bash
# Make sure React is running:
cd e:\PROJECTS\car
npm start

# Clear cache if needed:
npm cache clean --force
```

### Issue: Detection button not working
**Checklist:**
- [ ] All 3 services running (Flask, Node, React)
- [ ] Browser console has no red errors (F12)
- [ ] MongoDB connection working
- [ ] Try refreshing page
- [ ] Check network tab (F12) for failed requests

---

## 📋 Services Status Check

### Flask API (Port 5001)
```bash
# In Python terminal, you should see:
🚀 Loading ML Models...
✅ Loaded: best_insurance_model.pkl
✅ Loaded: scaler.pkl
✅ All required models loaded successfully!
🌐 Starting Flask API on http://127.0.0.1:5001
Press CTRL+C to quit
```

### Node Backend (Port 5000)
```bash
# In Node terminal, you should see:
listening on port 5000
```

### React Frontend (Port 3000)
```bash
# In React terminal, you should see:
Compiled successfully!
Local: http://localhost:3000
```

---

## 🎯 System Ready When You See:

✅ Flask terminal shows "Running on http://127.0.0.1:5001"  
✅ Node terminal shows "listening on port 5000"  
✅ React terminal shows "Compiled successfully!"  
✅ Browser opens http://localhost:3000 automatically  
✅ All 4 ML models loaded in Flask  

---

## 📊 Test Data Examples

### For Test Claim 1 (Likely Legitimate):
- Age: 35
- Accident History: 1
- Claim History: 0
- Credit Score: 750
- Annual Premium: 50000
- Expected Result: **Legitimate** (15-25% fraud probability)

### For Test Claim 2 (Likely Fraud):
- Age: 25
- Accident History: 5
- Claim History: 3
- Credit Score: 450
- Annual Premium: 20000
- Expected Result: **Fraud** (70-85% fraud probability)

---

## 🔄 Data Flow (What Happens Behind Scenes)

```
1. User fills claim form (10 ML features)
   ↓
2. Clicks "Submit Claim"
   ↓
3. React sends to Node backend: POST /api/claims/submit
   ↓
4. Node backend forwards to Flask: http://127.0.0.1:5001/predict
   ↓
5. Flask ML API:
   - Loads models from memory
   - Scales numeric features
   - Encodes categorical features
   - Runs RandomForest model
   - Returns fraud probability
   ↓
6. Node backend:
   - Receives ML response
   - Saves to MongoDB
   - Returns to React
   ↓
7. React displays prediction result ✅
   ↓
8. Admin sees claim in table with prediction
   ↓
9. Admin clicks "Detect"
   ↓
10. Same flow repeats (fresh prediction)
    ↓
11. Beautiful result card displays in UI ✅
```

---

## 💾 Database Check

To verify data is being saved:

```bash
# Open MongoDB CLI (if installed):
mongosh

# In mongo shell:
use carinsurance
db.claims.find().pretty()  # See all claims

db.claims.findOne({policyNumber: "POL-2026-xxx"})  # See specific claim
```

You should see fields like:
```javascript
{
  "_id": ObjectId(...),
  "userId": ObjectId(...),
  "policyNumber": "POL-2026-001",
  "licensePlate": "KA01AB1234",
  "predictionResult": "Legitimate",
  "fraudProbability": 0.15,
  "fraudRisk": "Low",
  "modelUsed": "RandomForest",
  "status": "Submitted",
  "createdAt": ISODate(...)
}
```

---

## 🎉 Success Indicators

✅ You're done when you see:

1. User login works
2. Insurance application saves policy number
3. Claim submission works
4. Prediction appears in claim
5. Admin login works
6. Admin sees claims in table
7. Admin clicks "Detect" button
8. **Result card displays with:**
   - Prediction (Fraud/Legitimate)
   - Fraud Probability percentage
   - Risk Level
   - Model information
   - No errors in browser console

---

## 📞 Quick Reference

| Component | Port | Start Command | Status |
|-----------|------|---------------|--------|
| Flask API | 5001 | `python app.py` | ✅ Ready |
| Node Backend | 5000 | `npm start` | ✅ Ready |
| React Frontend | 3000 | `npm start` | ✅ Ready |
| MongoDB | 27017 | Auto (if running) | ✅ Ready |

---

**🚀 You're all set! Start the services and test the complete workflow! 🎉**
