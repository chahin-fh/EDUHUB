const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const protect = require("../middleware/authMiddleware");
const { monitorOnly } = protect;
const requireEmailVerification = require("../middleware/emailVerification");

// @desc    Statistiques du tableau de bord mentor
// @route   GET /api/monitor/stats
// @access  Private (monitor/admin)
router.get("/stats", protect, monitorOnly, async (req, res) => {
  try {

    // Cours créés par ce moniteur (instructor OU uploadedBy, les deux champs
    // sont synchronisés par le modèle)
    const courses = await Course.find({
      $or: [{ instructor: req.user._id }, { uploadedBy: req.user._id }],
    }).select(
      "title courseName price discountPrice category level status thumbnail studentsEnrolled createdAt"
    );

    const courseIds = courses.map((c) => c._id);

    // Inscriptions aux cours du moniteur
    let enrollments = [];
    if (courseIds.length > 0) {
      enrollments = await Enrollment.find({ course: { $in: courseIds } })
        .populate("student", "name username email avatar")
        .populate("course", "title courseName price discountPrice")
        .sort({ enrolledAt: -1 });
    }

    // Étudiants uniques
    const uniqueStudents = new Set(enrollments.map((e) => e.student?._id?.toString()).filter(Boolean));

    // Revenus : somme des paiements complétés
    const completed = enrollments.filter((e) => e.paymentStatus === "completed");
    const revenue = completed.reduce((sum, e) => sum + (e.amountPaid || 0), 0);

    // Taux de complétion moyen
    const activeEnrollments = enrollments.filter((e) => e.status === "active" || e.status === "completed");
    const avgCompletion = activeEnrollments.length
      ? Math.round(
          (activeEnrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) /
            activeEnrollments.length) *
            10
        ) / 10
      : 0;

    // Stats par cours (Map pour un seul passage sur les inscriptions)
    const enrollmentsByCourse = new Map();
    enrollments.forEach((e) => {
      const key = e.course?._id?.toString();
      if (!key) return;
      const list = enrollmentsByCourse.get(key) || [];
      list.push(e);
      enrollmentsByCourse.set(key, list);
    });

    const perCourse = courses.map((course) => {
      const courseEnrollments = enrollmentsByCourse.get(course._id.toString()) || [];
      const courseRevenue = courseEnrollments
        .filter((e) => e.paymentStatus === "completed")
        .reduce((sum, e) => sum + (e.amountPaid || 0), 0);
      return {
        _id: course._id,
        title: course.title || course.courseName,
        category: course.category,
        level: course.level,
        status: course.status,
        thumbnail: course.thumbnail,
        price: course.price || course.discountPrice || 0,
        studentsEnrolled: courseEnrollments.length,
        revenue: courseRevenue,
      };
    });

    res.json({
      success: true,
      stats: {
        coursesCount: courses.length,
        studentsCount: uniqueStudents.size,
        revenue,
        avgCompletion,
        rating: req.user.monitorProfile?.rating || 0,
        ratingsCount: req.user.monitorProfile?.ratingsCount || 0,
        verified: req.user.monitorProfile?.verified || false,
        courses: perCourse,
        recentEnrollments: enrollments.slice(0, 8).map((e) => ({
          _id: e._id,
          student: e.student,
          course: e.course,
          paymentStatus: e.paymentStatus,
          amountPaid: e.amountPaid,
          completionPercentage: e.completionPercentage,
          status: e.status,
          enrolledAt: e.enrolledAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching monitor stats:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle monitor status for a user
// @route   POST /api/monitor/toggle
// @access  Private (email vérifié requis)
router.post("/toggle", protect, requireEmailVerification, async (req, res) => {
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
// @access  Private (monitor only, email vérifié requis)
router.put("/profile", protect, requireEmailVerification, async (req, res) => {
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
