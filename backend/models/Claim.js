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
carImage: String,
plateImage: String,
licenseImage: String,
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

    // Image Verification Fields
    vehicleSimilarity: {
      type: Number,
      default: 0,
    },

    licensePlateMatch: {
      type: Object,
      default: {
        storedPlate: "",
        detectedPlate: "",
        matchPercentage: 0,
      },
    },

    driverLicenseMatch: {
      type: Object,
      default: {
        storedLicenseNo: "",
        detectedLicenseNo: "",
        matchPercentage: 0,
      },
    },

    overallRiskScore: {
      type: Number,
      default: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Failed"],
      default: "Pending",
    },

    status: {
      type: String,
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
