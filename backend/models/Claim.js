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

    accidentImage: String,

    predictionResult: {
      type: String,
      default: "Pending",
    },

    fraudRisk: {
      type: String,
      default: "Low",
    },

    status: {
      type: String,
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
