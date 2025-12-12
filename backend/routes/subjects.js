const express = require('express');
const router = express.Router();
const { getSubjects, addSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/subjects
// @desc    Get all subjects
// @access  Public
router.get('/', getSubjects);

// @route   POST api/subjects
// @desc    Add a new subject
// @access  Private/Admin
router.post('/', auth, addSubject);

// @route   PUT api/subjects/:id
// @desc    Update a subject
// @access  Private/Admin
router.put('/:id', auth, updateSubject);

// @route   DELETE api/subjects/:id
// @desc    Delete a subject
// @access  Private/Admin
router.delete('/:id', auth, deleteSubject);

module.exports = router;
