const express = require("express");
const router = express.Router();

const upload = require("../middleware/insuranceUpload");
const generatePolicyNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return "POL" + random; // Example: POL483920
};
const {
  applyInsurance,
  getAllApplications,
  getUserApplications,
  updateApplicationStatus,
} = require("../controllers/insuranceController");

// ================================
// Multer Multiple File Upload Setup
// ================================
const multiUpload = upload.fields([
  { name: "licenseFront", maxCount: 1 },
  { name: "licenseBack", maxCount: 1 },
  { name: "vehicleFront", maxCount: 1 },
  { name: "vehicleBack", maxCount: 1 },
  { name: "vehicleSide", maxCount: 1 },

]);

// ================================
// ROUTES
// ================================

// Apply Insurance
router.post("/apply", multiUpload, applyInsurance);

// User Dashboard → My Applications
router.get("/myapplications/:userId", getUserApplications);

// Admin → Get all applications
router.get("/all", getAllApplications);

// Admin → Update status
router.put("/update/:id", updateApplicationStatus);

router.get("/latest/:userId", async (req, res) => {
  try {
    const Insurance = require("../models/InsuranceApplication");

    const data = await Insurance.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;






































































































































