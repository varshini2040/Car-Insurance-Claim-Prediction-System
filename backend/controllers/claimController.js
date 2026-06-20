const Claim = require("../models/Claim");
const axios = require("axios");
// ================================
// 1️⃣ USER SUBMIT CLAIM
// ================================
exports.submitClaim = async (req, res) => {
  try {
    const {
      userId,
      policyNumber,
      licensePlate,
      accidentDate,
      accidentLocation,
      damageType,
      driverAtFault,
      weather,
      describeAccident,
      estimatedCost,
      claimAmount,
        age,
  gender,
  vehicleAge,
  vehicleType,
  annualPremium,
  drivingExperience,
  accidentHistory,
  claimHistory,
  creditScore,
  policyDuration,
    } = req.body;

    // 🔥 VALIDATION
    if (!policyNumber || !licensePlate) {
      return res.status(400).json({
        message: "Policy Number or Vehicle Number missing ❌",
      });
    }

let carImage = "";
let plateImage = "";
let licenseImage = "";

if (req.files?.carImage?.[0]) {
  carImage = req.files.carImage[0].filename;
}

if (req.files?.plateImage?.[0]) {
  plateImage = req.files.plateImage[0].filename;
}

if (req.files?.licenseImage?.[0]) {
  licenseImage = req.files.licenseImage[0].filename;
}

// ML Prediction
const predictionResponse = await axios.post(
  "http://127.0.0.1:5001/predict",
  {
    age,
    gender,
    vehicle_age: vehicleAge,
    vehicle_type: vehicleType,
    annual_premium: annualPremium,
    driving_experience: drivingExperience,
    accident_history: accidentHistory,
    claim_history: claimHistory,
    credit_score: creditScore,
    policy_duration: policyDuration,
    stored_plate: licensePlate,
    stored_license_no: "TN123456789" // Placeholder - can be enhanced with actual data
  }
);

const mlPrediction = predictionResponse.data.prediction;
const fraudProbability = predictionResponse.data.fraud_probability;
const mlRiskLevel = predictionResponse.data.risk_level;
const imageVerification = predictionResponse.data.image_verification || {};
const overallRiskScore = predictionResponse.data.overall_risk_score || fraudProbability * 0.78;

    // ✅ CREATE CLAIM
const newClaim = new Claim({
  userId,
  policyNumber,
  licensePlate,

  // ML Prediction Fields
  age,
  gender,
  vehicleAge,
  vehicleType,
  annualPremium,
  drivingExperience,
  accidentHistory,
  claimHistory,
  creditScore,
  policyDuration,

  // Accident Details
  accidentDate,
  accidentLocation,
  damageType,

  // Existing Fields
  driverAtFault: driverAtFault || "Not Provided",
  weather: weather || "Not Provided",
  describeAccident: describeAccident || "Not Provided",
  estimatedCost: estimatedCost || 0,

  claimAmount,
  carImage,
  plateImage,
  licenseImage,

  prediction: mlPrediction,
  predictionResult: mlPrediction === 1 ? "Fraud Claim" : "Genuine Claim",
  fraudProbability: fraudProbability,
  fraudRisk: mlPrediction === 1 ? "High Risk" : "Low Risk",
  
  // Image Verification
  vehicleSimilarity: imageVerification.vehicle_similarity || 0,
  licensePlateMatch: imageVerification.license_plate_match || {},
  driverLicenseMatch: imageVerification.driver_license_match || {},
  overallRiskScore: overallRiskScore,
  verificationStatus: "Verified",
  
  status: "Submitted",
});
    await newClaim.save();

    res.status(201).json({
      success: true,
      message: "✅ Claim Submitted Successfully",
      claim: newClaim,
    });

  } catch (error) {
    console.log("BACKEND ERROR:", error);

    res.status(500).json({
      success: false,
      message: "❌ Claim Submission Failed",
      error: error.message,
    });
  }
};


// ================================
// 2️⃣ ADMIN VIEW ALL CLAIMS
// ================================
exports.getAllClaims = async (req, res) => {
  try {
  const claims = await Claim.find().populate("userId", "name email");
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================================
// 3️⃣ ADMIN APPROVE / REJECT CLAIM
// ================================
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let predictionResult = "Pending";
    let fraudRisk = "Under Review";

    if (status === "Approved") {
      predictionResult = "Approved";
      fraudRisk = "Low";
    }

    if (status === "Rejected") {
      predictionResult = "Rejected";
      fraudRisk = "High";
    }

    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        status,
        predictionResult,
        fraudRisk,
      },
      { new: true }
    );

    res.json({
      message: "✅ Claim Status Updated Successfully",
      claim,
    });

  } catch (error) {
    res.status(500).json({
      message: "❌ Status Update Failed",
      error: error.message,
    });
  }
};


// ================================
// 4️⃣ USER DASHBOARD → VIEW MY CLAIMS
// ================================
exports.getUserClaims = async (req, res) => {
  try {
    const { userId } = req.params;

    const claims = await Claim.find({ userId });

    res.status(200).json({
      message: "✅ User Claims Fetched Successfully",
      claims,
    });

  } catch (error) {
    res.status(500).json({
      message: "❌ Error Fetching User Claims",
      error: error.message,
    });
  }
};