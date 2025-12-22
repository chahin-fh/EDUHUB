const User = require("../models/User");

// @desc    Middleware to check if user's email is verified
const requireEmailVerification = async (req, res, next) => {
  try {
    // Skip verification for Google OAuth users and admin routes
    if (req.user && req.user.googleId) {
      return next();
    }

    // Check if user's email is verified
    if (req.user && !req.user.emailVerified) {
      return res.status(403).json({
        message:
          "Email verification required. Please verify your email address to access this feature.",
        emailVerified: false,
      });
    }

    next();
  } catch (error) {
    console.error("Email verification middleware error:", error);
    res.status(500).json({
      message: "Server error during email verification check",
      error: error.message,
    });
  }
};

module.exports = requireEmailVerification;
