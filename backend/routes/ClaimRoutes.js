const express = require("express");
const router = express.Router();

const upload = require("../middleware/insuranceUpload");
const {
  submitClaim,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
  getUserClaims,
  detectClaim,
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

// Admin View One Claim
router.get("/:id", getClaimById);

// Admin Update Status
router.put("/update/:id", updateClaimStatus);

// Admin: Generate full fraud detection report only when user clicks "Detect"
router.post("/:claimId/detect", detectClaim);

// Get Claims of Logged-in User
router.get("/myclaims/:userId", getUserClaims);

module.exports = router;

