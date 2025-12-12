const express = require("express");
const router = express.Router();

const passport = require("passport");
const jwt = require("jsonwebtoken");
const { registerUser, loginUser, getUserCount } = require("../controllers/authController");


const protect = require('../middleware/authMiddleware');

// Local Auth
router.post("/inscription", registerUser);
router.post("/connexion", loginUser);

// User count
router.get("/users/count", protect, getUserCount);

// Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/connexion",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Send token to frontend and redirect
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
