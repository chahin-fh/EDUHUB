const User = require("../models/User");
const Review = require("../models/Review");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// @desc    Get a single user detail (admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
      )
      .populate({ path: "monitorProfile.expertise.subject", select: "name slug" })
      .populate({ path: "learningGoals.subject", select: "name slug" });

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération", error: error.message });
  }
};

// @desc    Update a user (suspend, promote to monitor, verify email / mentor)
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { isActive, isMonitor, emailVerified, monitorVerified } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    // Empêcher de se suspendre soi-même ou de suspendre un autre admin
    if (isActive === false && (user.role === "admin" || user._id.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: "Impossible de suspendre un administrateur" });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (emailVerified !== undefined) user.emailVerified = emailVerified;

    if (isMonitor !== undefined) {
      user.isMonitor = isMonitor;
      if (isMonitor && !user.monitorProfile) user.monitorProfile = {};
      // Démotion : retirer aussi la vérification du profil mentor
      if (!isMonitor && user.monitorProfile) {
        user.monitorProfile.verified = false;
      }
    }

    if (monitorVerified !== undefined) {
      if (!user.monitorProfile) user.monitorProfile = {};
      user.monitorProfile.verified = monitorVerified;
      // Un mentor vérifié doit être marqué comme moniteur
      if (monitorVerified) user.isMonitor = true;
    }

    await user.save();

    const updated = await User.findById(user._id)
      .select("-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires");

    res.json({ success: true, message: "Utilisateur mis à jour", user: updated });
  } catch (error) {
    console.error("Error updating user (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour", error: error.message });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Impossible de supprimer un administrateur" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Impossible de supprimer votre propre compte" });
    }

    // Suppression en cascade douce : désactivation + retrait du statut moniteur
    user.isActive = false;
    user.isMonitor = false;
    if (user.monitorProfile) user.monitorProfile.verified = false;
    await user.save();

    res.json({ success: true, message: "Utilisateur supprimé (désactivé)" });
  } catch (error) {
    console.error("Error deleting user (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression", error: error.message });
  }
};

// @desc    List all reviews (admin moderation)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search) {
      const userIds = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id").lean();
      const ids = userIds.map((u) => u._id);
      query.$or = [{ from: { $in: ids } }, { to: { $in: ids } }];
    }

    const reviews = await Review.find(query)
      .populate("from", "name username email avatar")
      .populate("to", "name username email avatar")
      .populate("subject", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: { current: pageNum, pages: Math.ceil(total / limitNum), total, limit: limitNum },
    });
  } catch (error) {
    console.error("Error fetching reviews (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération", error: error.message });
  }
};

// @desc    Delete a review (admin moderation)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Avis introuvable" });
    }

    // Recalculer la note moyenne du mentor ciblé
    const targetId = review.to;
    await review.deleteOne();

    const aggregate = await Review.aggregate([
      { $match: { to: targetId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const stats = aggregate[0] || { avg: 0, count: 0 };
    await User.findByIdAndUpdate(targetId, {
      $set: {
        "monitorProfile.rating": Math.round(stats.avg * 10) / 10 || 0,
        "monitorProfile.ratingsCount": stats.count || 0,
      },
    });

    res.json({ success: true, message: "Avis supprimé" });
  } catch (error) {
    console.error("Error deleting review (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression", error: error.message });
  }
};

/* ===== Partie paiement commentée =====
// @desc    Global payments / enrollments history (admin)
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { paymentStatus: { $in: ["completed", "pending", "refunded", "failed"] } };
    if (status && ["completed", "pending", "refunded", "failed"].includes(status)) {
      query.paymentStatus = status;
    }

    const enrollments = await Enrollment.find(query)
      .populate("student", "name username email avatar")
      .populate("course", "title courseName price discountPrice category thumbnail")
      .sort({ paymentDate: -1, enrolledAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Enrollment.countDocuments(query);

    // Totaux pour les cartes de synthèse
    const totals = await Enrollment.aggregate([
      { $match: { paymentStatus: { $in: ["completed", "refunded"] } } },
      { $group: { _id: "$paymentStatus", total: { $sum: "$amountPaid" } } },
    ]);
    const revenueMap = {};
    totals.forEach((t) => (revenueMap[t._id] = t.total));

    res.json({
      success: true,
      payments: enrollments.map((e) => ({
        _id: e._id,
        student: e.student,
        course: e.course,
        amountPaid: e.amountPaid,
        paymentStatus: e.paymentStatus,
        paymentMethod: e.paymentMethod,
        transactionId: e.transactionId,
        paymentDate: e.paymentDate || e.enrolledAt,
        enrolledAt: e.enrolledAt,
      })),
      pagination: { current: pageNum, pages: Math.ceil(total / limitNum), total, limit: limitNum },
      revenue: { completed: revenueMap.completed || 0, refunded: revenueMap.refunded || 0 },
    });
  } catch (error) {
    console.error("Error fetching payments (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération", error: error.message });
  }
};
*/

// @desc    Admin activity log (récentes actions sensibles)
// @route   GET /api/admin/activity
// @access  Private/Admin
exports.getActivity = async (req, res) => {
  try {
    const [users, courses, enrollments, reviews, payments] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select("name username email role isMonitor createdAt avatar"),
      Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title courseName createdAt status uploadedBy instructor")
        .populate("uploadedBy", "name username email avatar")
        .populate("instructor", "name username email avatar"),
      Enrollment.find()
        .sort({ enrolledAt: -1 })
        .limit(5)
        .select("student course paymentStatus amountPaid enrolledAt")
        .populate("student", "name username email avatar")
        .populate("course", "title courseName category thumbnail"),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("from to rating comment createdAt")
        .populate("from", "name username email avatar")
        .populate("to", "name username email avatar"),
      // ⚠️ Partie paiement commentée (derniers paiements Stripe)
      // Enrollment.find({ paymentStatus: "completed" })
      //   .sort({ paymentDate: -1 })
      //   .limit(5)
      //   .select("student course amountPaid paymentDate transactionId")
      //   .populate("student", "name username email avatar")
      //   .populate("course", "title courseName category thumbnail"),
    ]);

    res.json({ success: true, activity: { users, courses, enrollments, reviews, payments } });
  } catch (error) {
    console.error("Error fetching activity (admin):", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération", error: error.message });
  }
};
