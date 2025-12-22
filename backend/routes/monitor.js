const express = require("express");
const router = express.Router();
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// @desc    Toggle monitor status for a user
// @route   POST /api/monitor/toggle
// @access  Private (user can toggle their own monitor status)
router.post("/toggle", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Admin can always be monitor
    if (user.role === "admin") {
      user.isMonitor = true;
    } else {
      // Users can toggle their monitor status
      user.isMonitor = !user.isMonitor;
    }

    await user.save();

    res.json({
      success: true,
      message: user.isMonitor
        ? "Monitor status activated"
        : "Monitor status deactivated",
      isMonitor: user.isMonitor,
      monitorProfile: user.monitorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update monitor profile
// @route   PUT /api/monitor/profile
// @access  Private (monitor only)
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isMonitor && user.role !== "admin") {
      return res.status(403).json({ message: "Monitor access required" });
    }

    const { expertise, bio } = req.body;

    if (expertise) {
      user.monitorProfile.expertise = expertise;
    }

    if (bio) {
      user.bio = bio;
    }

    await user.save();

    res.json({
      success: true,
      message: "Monitor profile updated",
      monitorProfile: user.monitorProfile,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all monitors
// @route   GET /api/monitor/all
// @access  Public
router.get("/all", async (req, res) => {
  try {
    const monitors = await User.find({
      $or: [{ isMonitor: true }, { role: "admin" }],
    }).select("name username email bio monitorProfile avatar role isMonitor");

    res.json({
      success: true,
      count: monitors.length,
      monitors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monitor profile by ID
// @route   GET /api/monitor/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const monitor = await User.findById(req.params.id).select(
      "name username email bio monitorProfile avatar role isMonitor"
    );

    if (!monitor || (!monitor.isMonitor && monitor.role !== "admin")) {
      return res.status(404).json({ message: "Monitor not found" });
    }

    res.json({
      success: true,
      monitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
