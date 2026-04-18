const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");   // ONE correct middleware import

// --------------------------
// USER SIGNUP
// --------------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    res.json({ success: true, user: newUser });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// --------------------------
// USER LOGIN
// --------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 ADMIN CHECK
    if (email === "admin@gmail.com" && password === "admin") {
      const token = jwt.sign(
        { id: "admin-id", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        token,
        user: {
          name: "Admin",
          email: "admin@gmail.com",
          role: "admin",
        },
      });
    }

    // 🔽 USER LOGIN
    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User does not exist" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user: {
        ...user._doc,
        role: "user",
      },
    });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});




// --------------------------
// GET USER PROFILE
// --------------------------
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json({ success: true, user });
  } catch (err) {
    return res.json({ success: false, message: "Profile fetch failed" });
  }
});

// --------------------------
// UPDATE USER PROFILE
// --------------------------
router.put("/profile", auth, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    return res.json({ success: true, updated });
  } catch (err) {
    return res.json({ success: false, message: "Profile update failed" });
  }
});

module.exports = router;
``// --------------------------
// ADMIN GET ANY USER DETAILS
// --------------------------
router.get("/admin/user/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Allow only admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not admin" });
    }

    const user = await User.findById(req.params.id).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});
// --------------------------
// ADMIN UPDATE USER
// --------------------------
router.put("/admin/user/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ success: false });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({ success: true, updated });
  } catch (err) {
    res.json({ success: false });
  }
});

