const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

/* 🔹 GET ALL USERS (ADMIN) */
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    if (!users || users.length === 0) {
      return res.json([]);
    }
    
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching users",
      error: err.message 
    });
  }
});

/* 🔹 GET SINGLE USER DETAILS */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: err.message
    });
  }
});


/* 🔹 UPDATE USER STATUS (APPROVE / REJECT) */
router.put("/:id/status", async (req, res) => {
  try {
    const { claimStatus } = req.body;

    if (!claimStatus) {
      return res.status(400).json({
        success: false,
        message: "claimStatus is required"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { claimStatus },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({ 
      success: true, 
      message: "Status updated",
      user: updatedUser
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ 
      success: false,
      message: "Status update failed",
      error: err.message
    });
  }
});

/* 🔹 UPDATE FULL USER PROFILE (ADMIN) */
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      updated: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message
    });
  }
});

/* 🔹 UPDATE USER'S OWN PROFILE */
router.put("/:id/profile", async (req, res) => {
  try {
    // Users can update their own profile
    const userId = req.params.id;
    
    // Make sure user can only update their own profile
    const storedUser = await User.findById(userId);
    
    if (!storedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update only allowed fields (prevent updating sensitive data)
    const allowedFields = [
      'fullName', 'phone', 'address', 'dateOfBirth','age',
'gender',
'maritalStatus',
'occupation',
'annualIncome','vehicleAge',
'engineCapacity',
'fuelType',
      'vehicleType', 'vehicleModel', 'vehicleYear', 'licensePlate', 'vehicleValue',
      'policyType', 'coverageAmount', 'premiumAmount', 'policyStartDate', 'policyEndDate',
      'accidentDate', 'accidentDescription', 'damageAmount'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Your profile has been updated successfully",
      updated: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: err.message
    });
  }
});

module.exports = router;
