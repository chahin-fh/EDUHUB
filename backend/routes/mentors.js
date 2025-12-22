const express = require("express");
const router = express.Router();
const {
  getMentors,
  getMentorById,
} = require("../controllers/mentorController");

// @route   GET api/mentors
// @desc    Get all mentors with optional search
// @access  Public
router.get("/", getMentors);

// @route   GET api/mentors/:id
// @desc    Get mentor by ID
// @access  Public
router.get("/:id", getMentorById);

module.exports = router;
