const Insurance = require("../models/InsuranceApplication");

// ================================
// APPLY INSURANCE
// ================================
// 🔥 Policy Number Generator
const generatePolicyNumber = () => {
  return "POL" + Date.now(); // unique 🔥
};

// ================================
// APPLY INSURANCE
// ================================
exports.applyInsurance = async (req, res) => {
  try {
    const User = require("../models/User");

    // 🔥 CHANGE HERE
    const policyNumber = req.body.policyNumber || generatePolicyNumber();
    const licensePlate = req.body.licensePlate;
    const userId = req.body.userId;

    const newInsurance = new Insurance({
      ...req.body,
      policyNumber,
 purchaseDate: req.body.purchaseDate || "Not Provided",
      licenseFront: req.files?.licenseFront?.[0]?.filename,
      licenseBack: req.files?.licenseBack?.[0]?.filename,
      vehicleFront: req.files?.vehicleFront?.[0]?.filename,
      vehicleBack: req.files?.vehicleBack?.[0]?.filename,
      vehicleSide: req.files?.vehicleSide?.[0]?.filename,
    });

    await newInsurance.save();

    // 🔥 UPDATE USER RECORD WITH POLICY NUMBER AND LICENSE PLATE
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        { policyNumber, licensePlate },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "Insurance Applied Successfully",
      policyNumber,
      licensePlate,
    });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


// ================================
// GET USER APPLICATIONS
// ================= ===============
exports.getUserApplications = async (req, res) => {
  try {
    const apps = await Insurance.find({ userId: req.params.userId });

    res.json({
      applications: apps,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Fetching Applications",
      error: error.message,
    });
  }
};

// ================================
// GET ALL APPLICATIONS (ADMIN)
// ================================
exports.getAllApplications = async (req, res) => {
  try {
    const apps = await Insurance.find();
    res.json(apps);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all applications",
      error: error.message,
    });
  }
};
// ================================
// UPDATE APPLICATION STATUS (ADMIN)
// ================================
exports.updateApplicationStatus = async (req, res) => {
  try {
    const updated = await Insurance.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({
      message: "Status updated",
      application: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
};
