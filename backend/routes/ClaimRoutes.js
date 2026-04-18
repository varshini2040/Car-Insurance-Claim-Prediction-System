const express = require("express");
const router = express.Router();

const upload = require("../middleware/insuranceUpload");
const {
  submitClaim,
  getAllClaims,
  updateClaimStatus,
  getUserClaims,
} = require("../controllers/claimController");

// User Submit Claim
router.post("/submit", upload.single("accidentImage"), submitClaim);

// Admin View All Claims
router.get("/all", getAllClaims);

// Admin Update Status
router.put("/update/:id", updateClaimStatus);
// Get Claims of Logged-in User
router.get("/myclaims/:userId", getUserClaims);

module.exports = router;
