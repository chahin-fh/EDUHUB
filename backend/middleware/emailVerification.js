const User = require("../models/User");

// @desc    Middleware to check if user's email is verified
const requireEmailVerification = async (req, res, next) => {
  try {
    // Check if user's email is verified
    if (req.user && !req.user.emailVerified) {
      return res.status(403).json({
        message:
          "Vérification d'email requise. Veuillez vérifier votre adresse email pour accéder à cette fonctionnalité.",
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
