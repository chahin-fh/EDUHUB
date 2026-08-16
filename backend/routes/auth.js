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
const { uploadAvatar } = require("../config/multer");

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
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .populate({
        path: "learningGoals.subject",
        select: "name slug",
      });
    res.status(200).json(user);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post(
  "/upload-avatar",
  protect,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier reçu" });
      }

      const user = await User.findById(req.user._id);
      // Stocker une URL absolue pour que l'avatar s'affiche partout
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      user.avatar = `${baseUrl}/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({ success: true, url: user.avatar });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
