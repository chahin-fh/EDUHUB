const User = require("../models/User");

// @desc    Get all potential mentors (students who teach)
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res) => {
  try {
    const { search, subject } = req.query;

    // Build query: use isMonitor as the flag
    let query = { isMonitor: true, isActive: true };

    // If search term provided, search by name or username
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // If subject provided (ObjectId), search in expertise array
    if (subject) {
      query["monitorProfile.expertise.subject"] = subject;
    }

    const mentors = await User.find(query)
      .select("-password")
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .populate({
        path: "learningGoals.subject",
        select: "name slug",
      })
      .sort({ createdAt: -1 });

    res.json(mentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await User.findOne({
      _id: req.params.id,
      isMonitor: true,
      isActive: true,
    })
      .select("-password")
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .populate({
        path: "learningGoals.subject",
        select: "name slug",
      });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
};
