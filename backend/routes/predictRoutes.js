const express = require("express");
const { spawn } = require("child_process");

const router = express.Router();

// POST Prediction Request
router.post("/predict", (req, res) => {
  try {
    const { age, vehicle_age, annual_premium, accident_history } = req.body;

    // Run Python Script
    const pythonProcess = spawn("python", ["predict.py", age, vehicle_age, annual_premium, accident_history]);

    let predictionResult = "";

    pythonProcess.stdout.on("data", (data) => {
      predictionResult += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python Error:", data.toString());
    });

    pythonProcess.on("close", () => {
      res.json({
        prediction: predictionResult.trim(),
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Prediction Failed" });
  }
});

module.exports = router;