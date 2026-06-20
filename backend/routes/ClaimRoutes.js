const express = require("express");
const router = express.Router();

const upload = require("../middleware/insuranceUpload");
const {
  submitClaim,
  getAllClaims,
  updateClaimStatus,
  getUserClaims,
} = require("../controllers/claimController");

const { predictClaim } = require("../controllers/predictController");

// User Submit Claim
router.post(
  "/submit",
  upload.fields([
    { name: "carImage", maxCount: 1 },
    { name: "plateImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 }
  ]),
  submitClaim
);

// ML Fraud Detection (Admin use)
router.post("/predict", predictClaim);

// Admin View All Claims
router.get("/all", getAllClaims);

// Admin Update Status
router.put("/update/:id", updateClaimStatus);

// Get Claims of Logged-in User
router.get("/myclaims/:userId", getUserClaims);

module.exports = router;
