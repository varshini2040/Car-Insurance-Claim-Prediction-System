const axios = require("axios");
const Claim = require("../models/Claim");

const predictClaim = async (req, res) => {
  try {
    // 🔥 MAP ALL FEATURES FOR ML MODEL
    const aiPayload = {
      age: Number(req.body.age) || 0,
      gender: req.body.gender || "Male",
      vehicle_age: Number(req.body.vehicleAge) || 0,
      vehicle_type: req.body.vehicleType || "Sedan",
      annual_premium: Number(req.body.annualPremium) || 0,
      driving_experience: Number(req.body.drivingExperience) || 0,
      accident_history: Number(req.body.accidentHistory) || 0,
      claim_history: Number(req.body.claimHistory) || 0,
      credit_score: Number(req.body.creditScore) || 600,
      policy_duration: Number(req.body.policyDuration) || 0
    };

    console.log("📊 Sending to ML API:", aiPayload);

    // ✅ CALL PYTHON ML API (PORT 5001)
    const aiResponse = await axios.post(
      "http://127.0.0.1:5001/predict",
      aiPayload,
      { timeout: 10000 } // 10 second timeout
    );

    console.log("✅ ML API Response:", aiResponse.data);

    // 🔥 UPDATE CLAIM WITH PREDICTION RESULT
    if (req.body.userId && req.body.policyNumber) {
      try {
        await Claim.findByIdAndUpdate(
          req.body.claimId,
          {
            predictionResult: aiResponse.data.prediction_label || (aiResponse.data.prediction === 1 ? "Fraud" : "Legitimate"),
            fraudRisk: aiResponse.data.risk_level,
            fraudProbability: aiResponse.data.fraud_probability / 100, // Convert percentage to decimal
            modelUsed: aiResponse.data.model_used
          },
          { new: true }
        );
      } catch (updateError) {
        console.log("Note: Could not update claim with prediction:", updateError.message);
      }
    }

    // ✅ RETURN PREDICTION RESULTS (Map snake_case to camelCase)
    res.json({
      success: true,
      prediction: aiResponse.data.prediction,
      predictionLabel: aiResponse.data.prediction_label,
      fraudProbability: aiResponse.data.fraud_probability / 100, // Convert percentage to decimal (0-1)
      legitimateProbability: aiResponse.data.legitimate_probability / 100,
      riskLevel: aiResponse.data.risk_level,
      modelUsed: aiResponse.data.model_used,
      inputFeatures: aiResponse.data.input_features
    });

  } catch (error) {
    console.error("❌ Prediction Error:", error.message);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: "ML API is not running. Please start the Python Flask server on port 5001",
        hint: "Run: python backend/ml_api/app.py"
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Prediction failed",
      hint: "Make sure ML API is running on port 5001"
    });
  }
};

module.exports = { predictClaim };
