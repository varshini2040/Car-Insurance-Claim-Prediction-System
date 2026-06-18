const Claim = require("../models/Claim");

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

    // 🔥 FILE FIX (works for both single & multiple)
    let accidentImage = "";
    if (req.file) {
      accidentImage = req.file.filename;
    } else if (req.files?.accidentImage?.[0]) {
      accidentImage = req.files.accidentImage[0].filename;
    }

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
  accidentImage,

  predictionResult: "Pending",
  fraudRisk: "Under Review",
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