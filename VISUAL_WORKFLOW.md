# 👀 Visual Workflow - What You'll See Step-by-Step

## Step 1: User Login

```
┌─────────────────────────────────────────┐
│  🏠 Insurance Fraud Detection System    │
├─────────────────────────────────────────┤
│                                         │
│  Email: [________________]              │
│  Password: [________________]           │
│                                         │
│  [Login]  [Sign Up]                    │
│                                         │
│ Don't have account? Create one.        │
└─────────────────────────────────────────┘

User enters:
- Email: user@test.com
- Password: test@123
- Click "Sign Up" or "Login"
```

---

## Step 2: Apply for Insurance

```
┌─────────────────────────────────────────┐
│  📋 Apply for Insurance                  │
├─────────────────────────────────────────┤
│                                         │
│ Name: [_________________]               │
│ Age: [_________________]                │
│ Gender: [Male ▼]                       │
│ Vehicle Type: [Sedan ▼]                │
│ Vehicle Age: [_________________]        │
│ Annual Premium: [_________________]     │
│ Driving Experience: [_________________] │
│ Credit Score: [_________________]       │
│                                         │
│ [Submit Application]                   │
│                                         │
└─────────────────────────────────────────┘

After clicking Submit:
✅ "Insurance Applied Successfully!"
✅ Policy Number: POL-2026-001 (auto-generated)
✅ License Plate: KA01AB1234 (extracted/saved)
✅ Saved to localStorage & MongoDB
```

---

## Step 3: View Policy & License Details

```
┌─────────────────────────────────────────┐
│  📝 Your Insurance Details               │
├─────────────────────────────────────────┤
│                                         │
│ 📋 Policy Number:                       │
│    POL-2026-001 (Read-only)            │
│                                         │
│ 🚗 License Plate:                       │
│    KA01AB1234 (Read-only)              │
│                                         │
│ Status: ✅ Active                       │
│                                         │
└─────────────────────────────────────────┘

(These fields auto-populate in Predict form)
```

---

## Step 4: Submit Claim (User Side)

```
┌─────────────────────────────────────────┐
│  📑 Submit Claim for Fraud Detection    │
├─────────────────────────────────────────┤
│                                         │
│ 📋 Policy Number:                       │
│    POL-2026-001  (auto-populated)      │
│                                         │
│ 🚗 License Plate:                       │
│    KA01AB1234  (auto-populated)        │
│                                         │
├─────────────────────────────────────────┤
│ Claim Details:                          │
├─────────────────────────────────────────┤
│ Accident Date: [DD/MM/YYYY]            │
│ Location: [_________________]           │
│ Damage Type: [Collision ▼]             │
│ Description: [__________________ ...]   │
│ Estimated Cost: [_________________]     │
│                                         │
├─────────────────────────────────────────┤
│ ML Feature Inputs:                      │
├─────────────────────────────────────────┤
│ Age: [35]                              │
│ Gender: [Male]                         │
│ Vehicle Age (years): [5]               │
│ Vehicle Type: [Sedan]                  │
│ Annual Premium: [50000]                │
│ Driving Experience (years): [10]       │
│ Accident History: [1]                  │
│ Claim History: [0]                     │
│ Credit Score: [750]                    │
│ Policy Duration (years): [2]           │
│                                         │
│ Upload Accident Image: [Choose File]   │
│                                         │
│ [Submit Claim]                         │
│                                         │
└─────────────────────────────────────────┘

After clicking Submit:
⏳ Processing... (sending to ML API)

✅ ML Detection Complete!

┌─────────────────────────────────────────┐
│  ✔ LEGITIMATE                           │
│  Fraud Probability: 15.00%              │
│  Risk Level: Low                        │
│  This claim is considered low risk      │
├─────────────────────────────────────────┤
│  Claim saved with prediction            │
│  Prediction Result: Legitimate          │
│  Model Used: RandomForest               │
│                                         │
│  [Close]                                │
└─────────────────────────────────────────┘
```

---

## Step 5: Admin Login

```
┌─────────────────────────────────────────┐
│  🔐 Admin Login                          │
├─────────────────────────────────────────┤
│                                         │
│ Email: [________________]               │
│ Password: [________________]            │
│                                         │
│ [Login]                                │
│                                         │
│ (Use admin account credentials)        │
└─────────────────────────────────────────┘

User enters:
- Email: admin@insurance.com
- Password: admin@123
- Click "Login"
```

---

## Step 6: Admin Dashboard - View Claims Table

```
┌──────────────────────────────────────────────────────────────┐
│  👨‍💼 Admin Dashboard                                           │
├──────────────────────────────────────────────────────────────┤
│ Sidebar:                                                     │
│ 📊 Dashboard                                                 │
│ 📋 Claims ← (Selected)                                       │
│ 👥 Users                                                     │
│ ⚙️  Settings                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Admin Claim Approval Dashboard                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ User     │ Vehicle   │ Amount │ Prediction │ Status   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ John Doe │ KA01AB123 │ 75,000 │ Legitimate │ Submitted│ │
│  │          │           │        │            │          │ │
│  │          │ [Detect]  │        │            │          │ │
│  │          │ [Approve] │        │            │          │ │
│  │          │ [Reject]  │        │            │          │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Jane S.  │ KA01XY567 │ 50,000 │ Fraud      │ Submitted│ │
│  │          │           │        │            │          │ │
│  │          │ [Detect]  │        │            │          │ │
│  │          │ [Approve] │        │            │          │ │
│  │          │ [Reject]  │        │            │          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Admin sees all claims submitted by users
Each row shows:
- Customer name
- Vehicle plate number
- Claim amount
- Current prediction (from user submission)
- Status
- Action buttons
```

---

## Step 7: Admin Clicks "Detect" Button

```
⏳ Processing... 
   (Sending claim features to ML API for fresh detection)

✨ Result Card appears:

┌──────────────────────────────────────────┐
│                                          │
│           ✔  LEGITIMATE                  │
│                                          │
│  Fraud Probability: 15.00%               │
│                                          │
│  This claim is considered low risk       │
│                                          │
├──────────────────────────────────────────┤
│ Claim Details:                           │
│ • Customer: John Doe                     │
│ • Vehicle: KA01AB1234                    │
│ • Claim Amount: ₹75,000                  │
│                                          │
│ ML Detection Results:                    │
│ • Risk Level: Low                        │
│ • Model Used: RandomForest               │
│ • Accident History: 1                    │
│ • Claim History: 0                       │
│ • Credit Score: 750                      │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│ ✓ Process the Claim - Low Risk           │
│                                          │
│ [Approve]  [Reject]  [Close]             │
│                                          │
└──────────────────────────────────────────┘
```

---

## ✅ Result Display Examples

### Example 1: LOW RISK (Legitimate Claim)

```
┌──────────────────────────────────────┐
│                                      │
│  ✔  LEGITIMATE        🟢 Green      │
│                                      │
│  Fraud Probability: 12.45%           │
│                                      │
│  This claim is considered low risk   │
│                                      │
├──────────────────────────────────────┤
│ Customer: Rajesh Kumar               │
│ Vehicle: KA01AB1234                  │
│ Claim: ₹50,000                       │
│                                      │
│ Risk Level: 🟢 Low                   │
│ Model: RandomForest                  │
│ Accidents: 0                         │
│ Previous Claims: 0                   │
│ Credit Score: 800                    │
│                                      │
├──────────────────────────────────────┤
│ ✓ Process Quickly - Low Risk         │
└──────────────────────────────────────┘
```

### Example 2: MEDIUM RISK (Needs Review)

```
┌──────────────────────────────────────┐
│                                      │
│  ⚠  REVIEW            🟠 Orange     │
│                                      │
│  Fraud Probability: 55.30%           │
│                                      │
│  This claim needs manual review      │
│                                      │
├──────────────────────────────────────┤
│ Customer: Priya Singh                │
│ Vehicle: KA02CD5678                  │
│ Claim: ₹150,000                      │
│                                      │
│ Risk Level: 🟠 Medium                │
│ Model: RandomForest                  │
│ Accidents: 2                         │
│ Previous Claims: 1                   │
│ Credit Score: 650                    │
│                                      │
├──────────────────────────────────────┤
│ ⚠ Investigate Further - Medium Risk  │
└──────────────────────────────────────┘
```

### Example 3: HIGH RISK (Fraud Alert)

```
┌──────────────────────────────────────┐
│                                      │
│  ✗  FRAUD             🔴 Red        │
│                                      │
│  Fraud Probability: 89.75%           │
│                                      │
│  This claim is flagged as high risk  │
│                                      │
├──────────────────────────────────────┤
│ Customer: Amit Patel                 │
│ Vehicle: KA03EF9999                  │
│ Claim: ₹500,000                      │
│                                      │
│ Risk Level: 🔴 High                  │
│ Model: RandomForest                  │
│ Accidents: 8                         │
│ Previous Claims: 5                   │
│ Credit Score: 380                    │
│                                      │
├──────────────────────────────────────┤
│ ✗ Investigate Thoroughly - High Risk │
└──────────────────────────────────────┘
```

---

## Step 8: Admin Takes Action

```
After reviewing result card:

Option 1: [Approve]
└─ Claim marked as "Approved"
└─ Status updated in MongoDB
└─ Email sent to user (optional)

Option 2: [Reject]
└─ Claim marked as "Rejected"
└─ Status updated in MongoDB
└─ Reason can be added (optional)

Option 3: [Close]
└─ Close the result card
└─ Return to claims table
```

---

## 📊 Complete User Journey Summary

```
USER SIDE
┌─────────────────────────┐
│ 1. Sign Up/Login        │ ✅
├─────────────────────────┤
│ 2. Apply Insurance      │ ✅
│    (Saves policy #)     │
├─────────────────────────┤
│ 3. Submit Claim         │ ✅
│    (10 ML features)     │
├─────────────────────────┤
│ 4. See Prediction       │ ✅
│    (In UI, not terminal)│
└─────────────────────────┘
           ↓
        ADMIN SIDE
┌─────────────────────────┐
│ 5. Admin Login          │ ✅
├─────────────────────────┤
│ 6. View All Claims      │ ✅
│    (In table format)    │
├─────────────────────────┤
│ 7. Click "Detect"       │ ✅
│    (Fresh prediction)   │
├─────────────────────────┤
│ 8. See Result Card      │ ✅
│    (Fraud probability)  │
├─────────────────────────┤
│ 9. Approve/Reject       │ ✅
│    (Save decision)      │
└─────────────────────────┘
```

---

## 🎨 UI Color Scheme

```
🟢 GREEN     = Legitimate (Fraud Prob < 30%)
              ✔ Safe to process
              Low risk indicator

🟠 ORANGE    = Review Needed (Fraud Prob 30-70%)
              ⚠ Manual investigation
              Medium risk indicator

🔴 RED       = Fraud Alert (Fraud Prob > 70%)
              ✗ High risk
              Flag for further action
```

---

## ⏱️ Timeline (What Happens at Each Step)

```
User submits claim
    ↓ (< 1 second)
React sends data to Node
    ↓ (< 50 ms)
Node sends to Flask
    ↓ (50-200 ms) ← ML processing time
Flask returns prediction
    ↓ (< 50 ms)
Node saves to MongoDB
    ↓ (< 100 ms)
React displays result
    ↓ (Instant)
Result shows in UI ✅

Total: < 500 ms
(Feels instant to user)
```

---

## 🎯 Success Indicators

You'll know everything is working when:

✅ User fills claim form → ML prediction shows immediately  
✅ Admin sees claims in table with predictions  
✅ Admin clicks "Detect" → Result card appears in UI  
✅ Fraud probability displays as percentage  
✅ Risk level shown with color coding  
✅ Model information displayed  
✅ No errors in browser console (F12)  
✅ No terminal output shown in UI  
✅ Admin can approve/reject claims  
✅ Data persists in MongoDB  

---

## 📱 Mobile Responsive Design

```
┌────────────────┐
│ Insurance App  │ (Mobile view)
├────────────────┤
│ Login          │
└────────────────┘
        ↓
┌────────────────┐
│ Apply Insurance│
│ [Form fields]  │
│ [Submit]       │
└────────────────┘
        ↓
┌────────────────┐
│ Submit Claim   │
│ [Form fields]  │
│ [Submit]       │
└────────────────┘
        ↓
┌────────────────┐
│ ✔ LEGITIMATE   │
│ Fraud: 15%     │
│ Risk: Low      │
│ [Approve]      │
│ [Reject]       │
└────────────────┘
```

---

**🎉 This is what your users will experience!**

The ML prediction results flow seamlessly from user submission through admin review, all displayed beautifully in the web interface instead of terminal logs!
