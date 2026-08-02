const CourseReview = require("../models/CourseReview");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");

// @desc    Recalculer la note moyenne et le nombre d'avis d'un cours
const recalculateCourseRating = async (courseId) => {
  const reviews = await CourseReview.find({ course: courseId });
  const total = reviews.length;
  const average =
    total > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10
        ) / 10
      : 0;

  await Course.findByIdAndUpdate(courseId, {
    rating: average,
    reviewsCount: total,
  });

  return { average, total };
};

// @desc    Create a course review (enrolled students only)
// @route   POST /api/course-reviews
// @access  Private (email vérifié requis)
exports.createCourseReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    if (!courseId || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Identifiant de cours invalide" });
    }

    if (rating === undefined || rating === null || rating === "") {
      return res
        .status(400)
        .json({ message: "courseId et rating sont requis" });
    }

    const parsedRating = Number(rating);
    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res
        .status(400)
        .json({ message: "La note doit être un entier entre 1 et 5" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    // L'auteur du cours ne peut pas se noter lui-même
    const courseOwnerId = (course.instructor || course.uploadedBy)?.toString();
    if (courseOwnerId && courseOwnerId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas noter votre propre cours" });
    }

    // Seuls les étudiants inscrits peuvent laisser un avis
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });
    if (!enrollment) {
      return res.status(403).json({
        message:
          "Vous devez être inscrit à ce cours pour laisser un avis",
      });
    }

    const existing = await CourseReview.findOne({
      course: courseId,
      user: req.user._id,
    });
    if (existing) {
      return res.status(400).json({
        message: "Vous avez déjà laissé un avis pour ce cours",
        review: existing,
      });
    }

    const finalComment = comment ? String(comment).trim() : "";
    if (finalComment.length > 1000) {
      return res
        .status(400)
        .json({ message: "Le commentaire ne doit pas dépasser 1000 caractères" });
    }

    const review = await CourseReview.create({
      course: courseId,
      user: req.user._id,
      rating: parsedRating,
      comment: finalComment,
    });

    await recalculateCourseRating(courseId);

    const populated = await CourseReview.findById(review._id)
      .populate("user", "name username avatar")
      .populate("course", "title courseName");

    res.status(201).json({
      success: true,
      message: "Avis envoyé avec succès",
      review: populated,
    });
  } catch (error) {
    console.error("Error creating course review:", error);
    res.status(500).json({
      message: "Erreur lors de la création de l'avis",
      error: error.message,
    });
  }
};

// @desc    Get reviews for a course
// @route   GET /api/course-reviews/:courseId
// @access  Public
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Identifiant de cours invalide" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const [reviews, total, all] = await Promise.all([
      CourseReview.find({ course: courseId })
        .populate("user", "name username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CourseReview.countDocuments({ course: courseId }),
      CourseReview.find({ course: courseId }).select("rating"),
    ]);

    const average =
      total > 0
        ? Math.round(
            (all.reduce((sum, r) => sum + r.rating, 0) / total) * 10
          ) / 10
        : 0;

    const distribution = [0, 0, 0, 0, 0];
    all.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });

    res.json({
      success: true,
      reviews,
      stats: {
        total,
        average,
        distribution,
      },
      pagination: {
        page,
        limit,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Error getting course reviews:", error);
    res.status(500).json({
      message: "Erreur lors du chargement des avis",
      error: error.message,
    });
  }
};

// @desc    Get my review for a course
// @route   GET /api/course-reviews/mine/:courseId
// @access  Private
exports.getMyCourseReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.courseId)) {
      return res.status(400).json({ message: "Identifiant de cours invalide" });
    }

    const review = await CourseReview.findOne({
      course: req.params.courseId,
      user: req.user._id,
    }).populate("user", "name username avatar");

    res.json({ success: true, review });
  } catch (error) {
    console.error("Error getting my course review:", error);
    res.status(500).json({
      message: "Erreur lors du chargement de votre avis",
      error: error.message,
    });
  }
};

// @desc    Update my review
// @route   PATCH /api/course-reviews/:id
// @access  Private
exports.updateCourseReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant d'avis invalide" });
    }

    const review = await CourseReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Vous ne pouvez modifier que votre propre avis" });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined && rating !== null && rating !== "") {
      const parsedRating = Number(rating);
      if (
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res
          .status(400)
          .json({ message: "La note doit être un entier entre 1 et 5" });
      }
      review.rating = parsedRating;
    }

    if (comment !== undefined) {
      const finalComment = String(comment).trim();
      if (finalComment.length > 1000) {
        return res
          .status(400)
          .json({ message: "Le commentaire ne doit pas dépasser 1000 caractères" });
      }
      review.comment = finalComment;
    }

    await review.save();
    await recalculateCourseRating(review.course);

    const populated = await CourseReview.findById(review._id)
      .populate("user", "name username avatar")
      .populate("course", "title courseName");

    res.json({
      success: true,
      message: "Avis mis à jour",
      review: populated,
    });
  } catch (error) {
    console.error("Error updating course review:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'avis",
      error: error.message,
    });
  }
};

// @desc    Delete a review (author or admin)
// @route   DELETE /api/course-reviews/:id
// @access  Private
exports.deleteCourseReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Identifiant d'avis invalide" });
    }

    const review = await CourseReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Vous ne pouvez supprimer que votre propre avis" });
    }

    const courseId = review.course;
    await CourseReview.findByIdAndDelete(req.params.id);
    await recalculateCourseRating(courseId);

    res.json({ success: true, message: "Avis supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting course review:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};
