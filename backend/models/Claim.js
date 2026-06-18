const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    licensePlate: String,
    policyNumber: String,
    accidentDate: String,
    accidentLocation: String,
    damageType: String,
    driverAtFault: String,
    weather: String,
    describeAccident: String,
    estimatedCost: Number,
    claimAmount: Number,
age: Number,
gender: String,
vehicleAge: Number,
vehicleType: String,
annualPremium: Number,
drivingExperience: Number,
accidentHistory: Number,
claimHistory: Number,
creditScore: Number,
policyDuration: Number,
    accidentImage: String,
prediction: {
  type: Number,
  default: 0,
},
    predictionResult: {
      type: String,
      default: "Pending",
    },

    fraudRisk: {
      type: String,
      default: "Low",
    },

    fraudProbability: {
      type: Number,
      default: 0,
    },

    modelUsed: {
      type: String,
      default: "random_forest",
    },

    status: {
      type: String,
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
