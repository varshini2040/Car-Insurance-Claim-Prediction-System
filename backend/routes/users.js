const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* 🔹 GET ALL USERS (ADMIN) */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
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
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
    });
  }
});


/* 🔹 UPDATE USER STATUS (APPROVE / REJECT) */
router.put("/:id/status", async (req, res) => {
  try {
    const { claimStatus } = req.body;

    await User.findByIdAndUpdate(req.params.id, { claimStatus });

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
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
      updated: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

module.exports = router;
