# 🏗️ System Architecture Diagram

## Current System Flow (With New Report)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                              │
│                                                                              │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐   │
│  │   Home Page      │ ──→  │  Predict Page    │ ──→  │  Results Page    │   │
│  │   (SignUp/In)    │      │  (Form Input)    │      │  (Report View)   │   │
│  └──────────────────┘      └──────────────────┘      └──────────────────┘   │
│                                     │                          ▲              │
│                                     │ POST Form Data           │              │
│                                     │ + Images                 │              │
│                                     v                          │              │
│                            ┌────────────────────┐      Retrieve from       │
│                            │  localStorage      │      localStorage        │
│                            │  (Store Claim)     │      Display Report     │
│                            └────────────────────┘      (6 Sections)       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    v                                 v
        ┌─────────────────────┐          ┌──────────────────────┐
        │  Backend Server     │          │   ML API Server      │
        │  (Express.js)       │  ◄────→  │   (Flask/Python)     │
        │  Port: 5000         │  POST:   │   Port: 5001         │
        │                     │  /predict│                      │
        └─────────────────────┘          └──────────────────────┘
                    │                            │
                    │ Process Response           │ Load Models
                    │ + Verification Data        │ • Random Forest
                    │ Extract Risk Score         │ • Scaler
                    │                            │ • Label Encoders
                    v                            │
        ┌─────────────────────┐          ML Models
        │   Controllers       │          ├─ best_insurance_model.pkl
        │                     │          ├─ scaler.pkl
        │ claimController.js  │          ├─ label_encoder_gender.pkl
        │                     │          └─ label_encoder_vehicle.pkl
        │ → Process Claim     │
        │ → Calculate Scores  │
        │ → Store Data        │
        └─────────────────────┘
                    │
                    v
        ┌─────────────────────┐
        │  Database Models    │
        │  (MongoDB)          │
        │                     │
        │ Claim Schema:       │
        │ • Core Prediction   │
        │ • Verification Data │
        │ • Risk Scores       │
        │ • Image Details     │
        └─────────────────────┘
                    │
                    v
        ┌─────────────────────┐
        │   MongoDB Storage   │
        │                     │
        │ Collections:        │
        │ ├─ claims           │
        │ ├─ users            │
        │ └─ transactions     │
        └─────────────────────┘
```

---

## Report Generation Process

```
┌────────────────────────────────────────────────────────────────────────┐
│                    USER SUBMITS CLAIM FORM                              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    v
                    ┌───────────────────────────┐
                    │  Form Validation          │
                    │  • Check required fields  │
                    │  • Validate data types    │
                    │  • Check file sizes       │
                    └───────────────────────────┘
                                    │
                                    v
                    ┌───────────────────────────┐
                    │  Create FormData          │
                    │  • Append all fields      │
                    │  • Append images (3)      │
                    │  • Set headers            │
                    └───────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  POST to Backend: /api/claims/submit              │
        │  Headers: multipart/form-data                     │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Backend: claimController.submitClaim()           │
        │  • Extract all fields                             │
        │  • Validate data                                  │
        │  • Prepare ML API payload                         │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Send to ML API: POST /predict                    │
        │  Payload:                                         │
        │  {                                                │
        │    age, gender, vehicle_age, vehicle_type,       │
        │    annual_premium, driving_experience,           │
        │    accident_history, claim_history,              │
        │    credit_score, policy_duration,                │
        │    stored_plate, stored_license_no               │
        │  }                                                │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  ML API: /predict endpoint                        │
        │  • Load models from joblib                        │
        │  • Preprocess features                            │
        │  • Encode categorical variables                   │
        │  • Scale features                                 │
        │  • Make prediction                                │
        │  • Calculate fraud probability                    │
        │  • Prepare verification data                      │
        │  • Calculate overall risk score                   │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  ML API Response:                                 │
        │  {                                                │
        │    prediction: 1/0,                               │
        │    fraud_probability: 82.49,                      │
        │    risk_level: "High",                            │
        │    image_verification: {...},                     │
        │    overall_risk_score: 64.34                      │
        │  }                                                │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Backend: Process Response                        │
        │  • Extract fraud probability                      │
        │  • Extract verification data                      │
        │  • Calculate risk scores                          │
        │  • Prepare claim object                           │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Backend: Create Claim Document                   │
        │  • Combine all data                               │
        │  • Add verification fields                        │
        │  • Set status to "Submitted"                      │
        │  • Mark as "Verified"                             │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  MongoDB: Save Claim                              │
        │  • Insert document                                │
        │  • Generate _id                                   │
        │  • Store timestamp                                │
        │  • Create indexes                                 │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Backend: Return Response                         │
        │  {                                                │
        │    success: true,                                 │
        │    claim: {COMPLETE_CLAIM_OBJECT}                 │
        │  }                                                │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Frontend: Store in localStorage                  │
        │  localStorage.setItem(                            │
        │    "predictionResult",                            │
        │    JSON.stringify(claim)                          │
        │  )                                                │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  Frontend: Auto-Navigate                          │
        │  navigate("/results")                             │
        │  (1 second delay)                                 │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  ResultsPage: Load Component                      │
        │  • Get claim from localStorage                    │
        │  • Get user from localStorage                     │
        │  • Extract all data fields                        │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
        ┌───────────────────────────────────────────────────┐
        │  ResultsPage: Render Report                       │
        │  Section 1: Claim Detection Report                │
        │  Section 2: Random Forest Analysis                │
        │  Section 3: Vehicle Verification                  │
        │  Section 4: License Plate Verification            │
        │  Section 5: Driver License Verification           │
        │  Section 6: Final Decision                        │
        └───────────────────────────────────────────────────┘
                                    │
                                    v
┌────────────────────────────────────────────────────────────────────────┐
│                   USER VIEWS FRAUD DETECTION REPORT                    │
│                                                                        │
│  ✅ All verification data displayed                                    │
│  ✅ Risk scores calculated                                             │
│  ✅ Recommended actions shown                                          │
│  ✅ Professional terminal-style layout                                 │
│  ✅ Interactive navigation buttons                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model Relationships

```
┌──────────────────────┐         ┌──────────────────────┐
│      User            │         │      Claim           │
├──────────────────────┤         ├──────────────────────┤
│ _id                  │─1──────N│ _id                  │
│ name                 │         │ userId (ref)         │
│ email                │         │ policyNumber         │
│ policyNumber         │         │ licensePlate         │
│ licensePlate         │         │ claimAmount          │
│ fullName             │         │ carImage             │
│ vehicleType          │         │ plateImage           │
│ vehicleAge           │         │ licenseImage         │
│ creditScore          │         │                      │
└──────────────────────┘         │ ML PREDICTION:       │
                                  │ prediction           │
                                  │ predictionResult     │
                                  │ fraudProbability     │
                                  │ fraudRisk            │
                                  │                      │
                                  │ VERIFICATION:        │
                                  │ vehicleSimilarity    │
                                  │ licensePlateMatch    │
                                  │ driverLicenseMatch   │
                                  │ overallRiskScore     │
                                  │ verificationStatus   │
                                  │                      │
                                  │ STATUS:              │
                                  │ status               │
                                  │ createdAt            │
                                  │ updatedAt            │
                                  └──────────────────────┘
```

---

## Component Architecture

```
App.js (Main Router)
│
├── Public Routes
│   ├── Home.js
│   ├── SignUp.js
│   └── SignIn.js
│
├── Protected Routes
│   ├── /predict
│   │   └── Predict.js
│   │       └── Form Submission
│   │           └── Calls: /api/claims/submit
│   │
│   ├── /results
│   │   └── ResultsPage.js  ✨ NEW
│   │       └── Reads: localStorage → predictionResult
│   │       └── Displays: 6-Section Report
│   │       └── Renders: ResultsPage.css  ✨ NEW
│   │
│   └── /dashboard
│       └── UserDashboard.js
│
└── Admin Routes
    └── AdminDashboard.js
```

---

## API Endpoints Flow

```
FRONTEND (React)
    │
    └─→ POST /api/claims/submit (multipart/form-data)
            │
            v
        BACKEND (Express.js)
            │
            ├─→ Validate & Process
            │
            └─→ POST http://127.0.0.1:5001/predict (JSON)
                    │
                    v
                ML API (Flask/Python)
                    │
                    ├─ Load Models
                    ├─ Preprocess Features
                    ├─ Predict
                    ├─ Calculate Risk
                    │
                    └─→ Return Response (JSON)
                            │
                            v
                    BACKEND (continued)
                            │
                            ├─ Extract Data
                            ├─ Create Claim Document
                            │
                            └─→ Save to MongoDB
                                    │
                                    v
                    BACKEND Response
                            │
                            └─→ Return to FRONTEND
                                    │
                                    ├─ Store in localStorage
                                    ├─ Auto-Navigate to /results
                                    │
                                    v
                                FRONTEND
                                    │
                                    └─→ ResultsPage.js
                                        └─ Display Report
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Component State (React)                    │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            v               v               v
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Predict.js   │ │ResultsPage.js│ │localStorage  │
    │              │ │              │ │              │
    │ formData     │ │ result       │ │predictionRsl │
    │ carImage     │ │ user         │ │              │
    │ plateImage   │ │              │ │{complete     │
    │ licenseImage │ │              │ │ claim data}  │
    │              │ │              │ │              │
    │ On Submit:   │ │On Mount:     │ │Used by:      │
    │ • POST API   │ │• Get from LS │ │• Results Pg  │
    │ • Store LS   │ │• Render Rpt  │ │              │
    │ • Navigate   │ │              │ │              │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Database Schema

```
CLAIMS Collection
├── _id: ObjectId
├── userId: ObjectId (ref to User)
├── policyNumber: String
├── licensePlate: String
├── claimAmount: Number
│
├── [ACCIDENT DETAILS]
├── accidentDate: Date
├── accidentLocation: String
├── damageType: String
│
├── [PREDICTION]
├── prediction: Number (0 or 1)
├── predictionResult: String
├── fraudProbability: Number
├── fraudRisk: String
├── modelUsed: String
│
├── [VERIFICATION] ✨ NEW
├── vehicleSimilarity: Number
├── licensePlateMatch: Object
│   ├── storedPlate: String
│   ├── detectedPlate: String
│   └── matchPercentage: Number
├── driverLicenseMatch: Object
│   ├── storedLicenseNo: String
│   ├── detectedLicenseNo: String
│   └── matchPercentage: Number
├── overallRiskScore: Number
├── verificationStatus: String
│
├── [STATUS]
├── status: String
├── createdAt: Date
└── updatedAt: Date
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            User's Browser                             │  │
│  │  http://localhost:3000                                │  │
│  │  ├── React App                                        │  │
│  │  ├── ResultsPage.js (Display Report)                 │  │
│  │  └── ResultsPage.css (Terminal Styling)              │  │
│  └────────────────────────────────────────────────────────┘  │
│                         ↕                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │       Backend Server (Node.js + Express)              │  │
│  │  http://localhost:5000                                │  │
│  │  ├── Routes: /api/claims/submit                       │  │
│  │  ├── Controllers: claimController.js                  │  │
│  │  ├── Models: Claim.js ✨ UPDATED                      │  │
│  │  └── Middleware: auth, upload                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                         ↕                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │    ML API Server (Flask + Python)                     │  │
│  │  http://127.0.0.1:5001                                │  │
│  │  ├── Endpoint: /predict                               │  │
│  │  ├── Models: .pkl files                               │  │
│  │  └── Image Verification (future)                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                         ↕                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          MongoDB Database                             │  │
│  │  Collections:                                         │  │
│  │  ├── users                                            │  │
│  │  ├── claims (with new verification fields)            │  │
│  │  └── transactions                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Architecture Updated**: 2026-06-19
**Version**: 2.0 (With Comprehensive Fraud Report)

