const axios = require("axios");

const predictClaim = async (req, res) => {
  try {
    const aiPayload = {
      age: Number(req.body.age),
      vehicle_age: Number(req.body.car_age),
      annual_premium: Number(req.body.premium),
      past_claims: Number(req.body.claims_history)
    };

    // ✅ CALL PYTHON AI (PORT 5001)
    const aiResponse = await axios.post(
      "http://127.0.0.1:5001/predict",
      aiPayload
    );

    const prediction = aiResponse.data.prediction;

    // ✅ THIS IS WHERE YOU ADD IT
    res.json({
      success: true,   // ⭐ VERY IMPORTANT
      probability: prediction === 1 ? 0.78 : 0.22,
      risk_level: prediction === 1 ? "High Risk" : "Low Risk",
      model_used: "random_forest",
      inputData: req.body
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({
      success: false,
      error: "Prediction failed"
    });
  }
};

module.exports = { predictClaim };
