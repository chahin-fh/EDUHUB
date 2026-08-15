const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Subject = require("../models/Subject");
const protect = require("../middleware/authMiddleware");
const { adminOnly } = protect;

// Le frontend envoie le NOM de la matière (ex: "Mathématiques") dans le filtre
// `subject`, alors que `monitorProfile.expertise.subject` stocke un ObjectId.
// Ce helper résout le nom (ou un ObjectId déjà valide) vers l'ObjectId attendu
// par la requête Mongoose, pour éviter une CastError -> 500.
async function resolveSubjectToId(subject) {
  if (!subject) return null;
  // Déjà un ObjectId valide (24 hex) -> utilisé tel quel
  if (/^[0-9a-fA-F]{24}$/.test(subject)) return subject;
  // Sinon c'est un nom -> chercher la matière correspondante
  const doc = await Subject.findOne({ name: subject }).lean();
  return doc ? doc._id : null;
}

// @desc    Get all mentors (public endpoint)
// @route   GET /api/usersList/public
// @access  Public
router.get("/public", async (req, res) => {
  try {
    const {
      search,
      subject,
      rating,
      experience,
      page = 1,
      limit = 12,
      sortBy = "monitorProfile.rating",
      sortOrder = "desc",
    } = req.query;

    // Build query - show all active monitors (even if not verified for now to fix visibility issue)
    let query = {
      isMonitor: true,
      // "monitorProfile.verified": true, // User reported they don't show up, likely not verified yet
      isActive: true,
    };

    // Search by name or username or email or bio
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        // `expertise.subject` est un ObjectId : on résout les noms de matières
        // correspondant à la recherche au lieu d'un $regex invalide sur un ObjectId
      ];
      const searchSubjectIds = await Subject.find({
        name: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      if (searchSubjectIds.length > 0) {
        query.$or.push({
          "monitorProfile.expertise.subject": {
            $in: searchSubjectIds.map((s) => s._id),
          },
        });
      }
    }

    // Filter by subject (expertise) - le frontend envoie le NOM de la matière
    if (subject) {
      const subjectId = await resolveSubjectToId(subject);
      // Matière introuvable -> $in: [] pour ne rien matcher (et non null,
      // qui ferait ressortir les utilisateurs sans expertise)
      query["monitorProfile.expertise.subject"] = subjectId || { $in: [] };
    }

    // Filter by rating
    if (rating) {
      const minRating = parseInt(rating);
      query["monitorProfile.rating"] = { $gte: minRating };
    }

    // Filter by experience (based on creation date)
    if (experience) {
      const now = new Date();
      let experienceDate;

      if (experience === "senior") {
        experienceDate = new Date(
          now.getFullYear() - 3,
          now.getMonth(),
          now.getDate()
        );
      } else if (experience === "intermediate") {
        experienceDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
      } else if (experience === "beginner") {
        experienceDate = new Date(
          now.getFullYear() - 0.5,
          now.getMonth(),
          now.getDate()
        );
      }

      if (experienceDate) {
        query.createdAt = { $lte: experienceDate };
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    const validSortFields = [
      "name",
      "username",
      "email",
      "createdAt",
      "role",
      "isMonitor",
      "monitorProfile.rating",
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : "monitorProfile.rating";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    sortOptions[sortField] = sortDirection;

    // Get mentors
    const mentors = await User.find(query)
      .select(
        "name username email role isMonitor monitorProfile avatar bio createdAt isActive emailVerified"
      )
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get unique subjects for filtering (using Subject names from populated data)
    const subjects = await Subject.find({}).select("name slug").lean();

    res.json({
      success: true,
      users: mentors,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
      subjects: subjects.map((s) => s.name),
      filters: {
        search: search || "",
        subject: subject || "",
        rating: rating || "",
        experience: experience || "",
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching public mentors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mentors",
      error: error.message,
    });
  }
});

// @desc    Get all users with search and filtering
// @route   GET /api/usersList
// @access  Private/Admin (la page frontend /users est admin-only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      search,
      subject,
      role,
      status,
      page = 1,
      limit = 50, // Augmenter la limite par défaut
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    let query = {};

    // Search by name or username or email or bio
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        // `expertise.subject` est un ObjectId : on résout les noms de matières
        // correspondant à la recherche au lieu d'un $regex invalide sur un ObjectId
      ];
      const searchSubjectIds = await Subject.find({
        name: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      if (searchSubjectIds.length > 0) {
        query.$or.push({
          "monitorProfile.expertise.subject": {
            $in: searchSubjectIds.map((s) => s._id),
          },
        });
      }
    }

    // Filter by subject (expertise) - le frontend envoie le NOM de la matière
    if (subject) {
      const subjectId = await resolveSubjectToId(subject);
      // Matière introuvable -> $in: [] pour ne rien matcher (et non null,
      // qui ferait ressortir les utilisateurs sans expertise)
      query["monitorProfile.expertise.subject"] = subjectId || { $in: [] };
    }

    // Filter by role
    if (role) {
      if (role === "monitor") {
        query.isMonitor = true;
      } else {
        query.role = role;
      }
    }

    // Filter by status
    if (status) {
      if (status === "active") {
        query.isActive = true;
      } else if (status === "inactive") {
        query.isActive = false;
      } else if (status === "verified") {
        query.emailVerified = true;
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    const validSortFields = [
      "name",
      "username",
      "email",
      "createdAt",
      "role",
      "isMonitor",
      "monitorProfile.rating",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    sortOptions[sortField] = sortDirection;

    // Get users
    const users = await User.find(query)
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
      )
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get unique subjects for filtering (using Subject names from populated data)
    const subjects = await Subject.find({}).select("name slug").lean();

    res.json({
      success: true,
      users,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
      subjects: subjects.map((s) => s.name),
      filters: {
        search: search || "",
        subject: subject || "",
        role: role || "",
        status: status || "",
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/usersList/stats
// @access  Private/Admin
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const regularUsers = await User.countDocuments({ role: "user" });
    const monitors = await User.countDocuments({ isMonitor: true });
    const activeMonitors = await User.countDocuments({
      isMonitor: true,
      "monitorProfile.verified": true,
    });

    // Get recent users
    const recentUsers = await User.find()
      .select("name username email role isMonitor createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        admin: adminUsers,
        user: regularUsers,
        monitors,
        activeMonitors,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
});

// @desc    Get user by ID (profil public consulté par la page /users/[id])
// @route   GET /api/usersList/:id
// @access  Private (tout utilisateur authentifié)
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
      )
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .populate({
        path: "learningGoals.subject",
        select: "name slug",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's courses if they are a monitor
    let userCourses = [];
    if (user.isMonitor || user.role === "admin") {
      const Course = require("../models/Course");
      userCourses = await Course.find({
        uploadedBy: user._id,
      }).select("courseName description createdAt status category level");
    }

    res.json({
      success: true,
      user,
      courses: userCourses,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
});

// @desc    Get all users (endpoint admin)
// @route   GET /api/usersList/all-users
// @access  Private/Admin (le frontend ne consomme pas cette route publiquement)
router.get("/all-users", protect, adminOnly, async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;

    // Build query - only show regular users (not monitors)
    let query = {
      role: "user",
      isActive: true,
    };

    // Search by name, username
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

module.exports = router;
