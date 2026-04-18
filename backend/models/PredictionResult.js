import mongoose from "mongoose";

const predictionResultSchema = new mongoose.Schema(
  {
    inputData: {
      age: Number,
      gender: String,
      car_age: Number,
      premium: Number,
      claims_history: Number,
      vehicle_type: String,
      annual_mileage: Number,
      driving_experience: Number
    },

    prediction: {
      type: String, // "Claim Likely" / "No Claim"
      required: true
    },

    probability: {
      type: Number, // percentage
      required: true
    },

    risk_level: {
      type: String, // Low / Medium / High
      required: true
    },

    model_used: {
      type: String,
      default: "random_forest"
    }
  },
  { timestamps: true }
);

export default mongoose.model("PredictionResult", predictionResultSchema);
