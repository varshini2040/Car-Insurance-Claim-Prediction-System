const multer = require("multer");
const path = require("path");

// Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Upload Middleware
const upload = multer({
  storage: storage,
});

module.exports = upload;
