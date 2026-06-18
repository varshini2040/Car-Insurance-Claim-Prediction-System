const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// --------------------
// Middlewares
// --------------------
app.use(cors()); // ✅ Enable CORS
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// --------------------
// Routes
// --------------------
app.use("/api/users", require("./routes/users"));

const insuranceRoutes = require("./routes/insuranceRoutes");
app.use("/api/insurance", insuranceRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const ClaimRoutes = require("./routes/ClaimRoutes");
app.use("/api/claims", ClaimRoutes);

// 🔹 ML Prediction Route
const predictRoutes = require("./routes/predictRoutes");
app.use("/api", predictRoutes);

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✔ MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// --------------------
// Start Server
// --------------------
app.listen(process.env.PORT || 5000, () =>
  console.log(`✔ Server running on port ${process.env.PORT || 5000}`)
);
app.get("/", (req, res) => {
res.send("Backend Working Successfully 🚀");
});

