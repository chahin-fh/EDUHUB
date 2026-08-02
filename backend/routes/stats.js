const express = require("express");
const router = express.Router();
const {
  getHomeStats,
  getAdminStats,
  getDashboardStats,
} = require("../controllers/statsController");
const protect = require("../middleware/authMiddleware");
const { adminOnly } = protect;

// @route   GET /api/stats/home
// @desc    Homepage statistics (public)
// @access  Public
router.get("/home", getHomeStats);

// @route   GET /api/stats/admin
// @desc    Admin dashboard statistics
// @access  Private/Admin
router.get("/admin", protect, adminOnly, getAdminStats);

// @route   GET /api/stats/dashboard
// @desc    User dashboard statistics
// @access  Private
router.get("/dashboard", protect, getDashboardStats);

module.exports = router;
