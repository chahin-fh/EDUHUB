const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserCount,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const { adminOnly } = protect;
const User = require("../models/User");
const { uploadImage } = require("../config/cloudinary");

// Local Auth
router.post("/inscription", registerUser);
router.post("/connexion", loginUser);

// User count
router.get("/users/count", protect, adminOnly, getUserCount);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Email verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, (req, res) => {
  res.status(200).json(req.user);
});

router.post(
  "/upload-avatar",
  protect,
  uploadImage.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      user.avatar = req.file.path;
      await user.save();

      res.json({ success: true, url: req.file.path });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
