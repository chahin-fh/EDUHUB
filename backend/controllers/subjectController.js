const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a new subject
// @route   POST /api/subjects
// @access  Private/Admin
exports.addSubject = async (req, res) => {
  const { name } = req.body;

  try {
    const newSubject = new Subject({
      name
    });

    const subject = await newSubject.save();
    res.json(subject);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Subject already exists' });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res) => {
  const { name } = req.body;

  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) return res.status(404).json({ msg: 'Subject not found' });

    subject.name = name;
    await subject.save();

    res.json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ msg: 'Subject not found' });
    }

    res.json({ msg: 'Subject removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
