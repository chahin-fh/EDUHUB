const express = require("express");
const router = express.Router();
const {
  getSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const protect = require("../middleware/authMiddleware");
const { adminOnly } = protect;

// @route   GET api/subjects
// @desc    Get all subjects
// @access  Public
router.get("/", getSubjects);

// @route   POST api/subjects
// @desc    Add a new subject
// @access  Private/Admin
router.post("/", protect, adminOnly, addSubject);

// @route   PUT api/subjects/:id
// @desc    Update a subject
// @access  Private/Admin
router.put("/:id", protect, adminOnly, updateSubject);

// @route   DELETE api/subjects/:id
// @desc    Delete a subject
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, deleteSubject);

module.exports = router;
