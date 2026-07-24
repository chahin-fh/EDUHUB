const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  findMentorsBySubject,
  getMatchingSubjects,
  createMatchRequest,
  respondToMatchRequest,
  getMyMatchRequests,
} = require("../controllers/matchingController");

// @route   GET /api/matching/subjects
// @desc    Get all subjects with mentor counts
// @access  Public
router.get("/subjects", getMatchingSubjects);

// @route   GET /api/matching/find
// @desc    Find students who teach a subject
// @access  Private
router.get("/find", protect, findMentorsBySubject);

// @route   GET /api/matching/requests
// @desc    Get user's match requests
// @access  Private
router.get("/requests", protect, getMyMatchRequests);

// @route   POST /api/matching/request
// @desc    Create a match request
// @access  Private
router.post("/request", protect, createMatchRequest);

// @route   PATCH /api/matching/request/:id
// @desc    Accept or decline a match request
// @access  Private
router.patch("/request/:id", protect, respondToMatchRequest);

module.exports = router;
