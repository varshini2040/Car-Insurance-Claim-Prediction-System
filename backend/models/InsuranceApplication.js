const mongoose = require("mongoose");

const insuranceSchema = new mongoose.Schema({
  policyNumber: { type: String, unique: true },
  userId: String,
  userName: String,
  userEmail: String,
  userPhoneNumber: String,
  vehicleType: String,
  vehicleModel: String,
  vehicleYear: String,
  licensePlate: String,
  purchaseDate: String,

  coverageType: String,
  previousClaims: String,
  drivingExperience: String,
  annualMileage: String,
  policyDuration: String,
  licenseFront: String,
  licenseBack: String,
  vehicleFront: String,
  vehicleBack: String,
  vehicleSide: String,


  status: { type: String, default: "pending" },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InsuranceApplication", insuranceSchema);
