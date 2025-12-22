const express = require("express");
const router = express.Router();
const { updateProfile, getProfile } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, updateProfile);

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", protect, getProfile);

module.exports = router;
