const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // BASIC SIGNUP INFO
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // PERSONAL DETAILS
    fullName: String,
    phone: String,
    address: String,
    dateOfBirth: String,

    // VEHICLE DETAILS
    vehicleType: String,
    vehicleModel: String,
    vehicleYear: String,
    licensePlate: String,
    vehicleValue: String,

    // POLICY DETAILS
    policyNumber: String,
    policyType: String,
    coverageAmount: String,
    premiumAmount: String,
    policyStartDate: String,
    policyEndDate: String,

    // ACCIDENT HISTORY
    accidentDate: String,
    accidentDescription: String,
    damageAmount: String,
    claimStatus: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
