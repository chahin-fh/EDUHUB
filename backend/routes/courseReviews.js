const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const requireEmailVerification = require("../middleware/emailVerification");
const {
  createCourseReview,
  getCourseReviews,
  getMyCourseReview,
  updateCourseReview,
  deleteCourseReview,
} = require("../controllers/courseReviewController");

// @route   GET /api/course-reviews/mine/:courseId
// @desc    Mon avis sur un cours
// @access  Private
router.get("/mine/:courseId", protect, getMyCourseReview);

// @route   GET /api/course-reviews/:courseId
// @desc    Avis d'un cours
// @access  Public
router.get("/:courseId", getCourseReviews);

// @route   POST /api/course-reviews
// @desc    Créer un avis (inscrit au cours requis)
// @access  Private (email vérifié requis)
router.post("/", protect, requireEmailVerification, createCourseReview);

// @route   PATCH /api/course-reviews/:id
// @desc    Modifier mon avis
// @access  Private
router.patch("/:id", protect, updateCourseReview);

// @route   DELETE /api/course-reviews/:id
// @desc    Supprimer mon avis
// @access  Private
router.delete("/:id", protect, deleteCourseReview);

module.exports = router;
