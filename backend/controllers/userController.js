const User = require("../models/User");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      birthdate,
      about,
      subjects, // Array of strings (subject names) for backward compatibility
      expertise, // Array of { subject: ObjectId, level: string }
      learningGoals, // Array of { subject: ObjectId, level: string }
    } = req.body;

    // Find user and update
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (birthdate !== undefined) user.birthdate = birthdate;
    if (about !== undefined) user.bio = about;

    // Update expertise (new format: array of { subject, level })
    if (expertise !== undefined) {
      if (!user.monitorProfile) user.monitorProfile = {};
      user.monitorProfile.expertise = expertise;
      // Automatically set isMonitor if they have expertise
      if (expertise.length > 0) {
        user.isMonitor = true;
      }
    } else if (subjects !== undefined) {
      // Legacy fallback: keep backward compatibility
      if (!user.monitorProfile) user.monitorProfile = {};
      user.monitorProfile.expertise = subjects;
    }

    // Update learning goals
    if (learningGoals !== undefined) {
      user.learningGoals = learningGoals;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .populate({
        path: "learningGoals.subject",
        select: "name slug",
      });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug",
      })
      .populate({
        path: "learningGoals.subject",
        select: "name slug",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
