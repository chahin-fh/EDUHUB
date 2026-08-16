const User = require("../models/User");
const {
  generateVerificationToken,
  createTransporter,
} = require("./authController");
const { verificationEmail } = require("../config/emailTemplates");

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
      city,
      country,
      github,
      linkedin,
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
    if (phone !== undefined) user.phone = phone;
    if (birthdate !== undefined) user.birthdate = birthdate;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (about !== undefined) user.bio = about;

    // Handle email change : unicité + re-vérification obligatoire
    let emailChanged = false;
    if (email !== undefined && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ message: "Cet email est déjà utilisé par un autre compte" });
      }

      user.email = email.toLowerCase();
      // Un nouvel email = compte à re-vérifier
      user.emailVerified = false;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      emailChanged = true;

      // Générer un nouveau token et envoyer l'email de vérification
      try {
        const verificationToken = generateVerificationToken();
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        const transporter = createTransporter();
        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Vérifiez votre nouvel email – EDUHUB",
            html: verificationEmail(
              user.name || user.username,
              verificationUrl
            ),
          });
        }
      } catch (emailError) {
        console.error("Failed to send re-verification email:", emailError);
      }
    }

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
      emailChanged,
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
