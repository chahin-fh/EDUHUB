const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Subject = require("../models/Subject");
const Establishment = require("../models/Establishment");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Review = require("../models/Review");

// @desc    Get homepage statistics (public)
// @route   GET /api/stats/home
// @access  Public
exports.getHomeStats = async (req, res) => {
  try {
    const [totalUsers, totalMonitors, totalCourses, totalSubjects, ratingAgg] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isMonitor: true, isActive: true }),
        Course.countDocuments({
          status: { $in: ["active", "published"] },
        }),
        Subject.countDocuments(),
        User.aggregate([
          {
            $match: {
              isMonitor: true,
              isActive: true,
              "monitorProfile.ratingsCount": { $gt: 0 },
            },
          },
          { $group: { _id: null, avg: { $avg: "$monitorProfile.rating" } } },
        ]),
      ]);

    const averageRating = ratingAgg.length
      ? Math.round(ratingAgg[0].avg * 10) / 10
      : null;

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        monitors: totalMonitors,
        courses: totalCourses,
        subjects: totalSubjects,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Error fetching home stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/stats/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      adminUsers,
      regularUsers,
      monitors,
      activeMonitors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalMessages,
      totalSubjects,
      totalEstablishments,
      totalReviews,
      recentUsers,
      recentCourses,
      recentEnrollments,
      recentMessages,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ isMonitor: true }),
      User.countDocuments({
        isMonitor: true,
        "monitorProfile.verified": true,
      }),
      Course.countDocuments(),
      Course.countDocuments({ status: { $in: ["active", "published"] } }),
      Enrollment.countDocuments(),
      Message.countDocuments(),
      Subject.countDocuments(),
      Establishment.countDocuments(),
      Review.countDocuments(),
      User.find()
        .select("name username email role isMonitor createdAt avatar")
        .sort({ createdAt: -1 })
        .limit(5),
      Course.find()
        .populate("instructor", "name username")
        .populate("uploadedBy", "name username")
        .select("title courseName createdAt status")
        .sort({ createdAt: -1 })
        .limit(5),
      Enrollment.find()
        .populate("student", "name username")
        .populate("course", "title courseName")
        .sort({ createdAt: -1 })
        .limit(5),
      Message.find()
        .populate("sender", "name username avatar")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Taux d'engagement = inscriptions / utilisateurs
    const engagementRate = totalUsers
      ? Math.min(100, Math.round((totalEnrollments / totalUsers) * 100))
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admin: adminUsers,
          user: regularUsers,
          monitors,
          activeMonitors,
        },
        courses: { total: totalCourses, published: publishedCourses },
        enrollments: totalEnrollments,
        messages: totalMessages,
        subjects: totalSubjects,
        establishments: totalEstablishments,
        reviews: totalReviews,
        engagementRate,
        recentUsers,
        recentCourses,
        recentEnrollments,
        recentMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Get user dashboard statistics (per user)
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [enrollments, conversationsCount] = await Promise.all([
      Enrollment.find({ student: userId })
        .populate("course", "title courseName")
        .sort({ createdAt: -1 }),
      Conversation.countDocuments({ participants: userId }),
    ]);

    const enrolledCourses = enrollments.length;
    const studyMinutes = enrollments.reduce(
      (sum, e) =>
        sum +
        (e.progress || []).reduce(
          (acc, p) => acc + (p.timeSpent || 0),
          0
        ),
      0
    );
    const studyHours = Math.round((studyMinutes / 60) * 10) / 10;

    const avgCompletion = enrollments.length
      ? Math.round(
          enrollments.reduce(
            (acc, e) => acc + (e.completionPercentage || 0),
            0
          ) / enrollments.length
        )
      : 0;

    // Activité hebdomadaire (7 derniers jours) basée sur les inscriptions
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const cours = await Enrollment.countDocuments({
        student: userId,
        createdAt: { $gte: start, $lte: end },
      });
      weeklyActivity.push({ name: dayNames[day.getDay()], cours });
    }

    // Activités récentes de l'utilisateur
    const recentActivities = [];

    const recentEnrollments = enrollments.slice(0, 3);
    recentEnrollments.forEach((e) => {
      const title = e.course?.title || e.course?.courseName || "Cours";
      recentActivities.push({
        type: "course",
        title: "Nouveau cours suivi",
        description: title,
        time: timeAgo(e.createdAt || e.enrolledAt),
      });
    });

    const myRecentMessages = await Message.find({ sender: userId })
      .sort({ createdAt: -1 })
      .limit(3);
    myRecentMessages.forEach((m) => {
      recentActivities.push({
        type: "message",
        title: "Message envoyé",
        description: m.text,
        time: timeAgo(m.createdAt),
      });
    });

    // Progression par cours (pour la carte "Progression du cours")
    const courseProgress = enrollments.slice(0, 3).map((e) => ({
      title: e.course?.title || e.course?.courseName || "Cours",
      completionPercentage: e.completionPercentage || 0,
    }));

    res.status(200).json({
      success: true,
      stats: {
        enrolledCourses,
        studyHours,
        tutors: conversationsCount,
        progression: avgCompletion,
        weeklyActivity,
        recentActivities,
        courseProgress,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}
