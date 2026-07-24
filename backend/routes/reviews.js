const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createReview,
  getUserReviews,
  getMyReviews,
  deleteReview,
} = require("../controllers/reviewController");

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post("/", protect, createReview);

// @route   GET /api/reviews/mine
// @desc    Get reviews I gave
// @access  Private
router.get("/mine", protect, getMyReviews);

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews for a user
// @access  Public
router.get("/user/:userId", getUserReviews);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete("/:id", protect, deleteReview);

module.exports = router;
