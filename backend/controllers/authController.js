const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
    expiresIn: "30d",
  });
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate reset token
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  return crypto.createHash("sha256").update(resetToken).digest("hex");
};

// Generate email verification token
const generateVerificationToken = () => {
  const verificationToken = crypto.randomBytes(20).toString("hex");
  return crypto.createHash("sha256").update(verificationToken).digest("hex");
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const effectiveName = name || username;

    // Validation
    if (!effectiveName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username: effectiveName }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with that email or username" });
    }

    // Generate email verification token
    const verificationToken = generateVerificationToken();

    const user = await User.create({
      name: effectiveName,
      username: username || effectiveName,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    if (user) {
      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      const verificationMessage = `
<h2>Email Verification Required</h2>
<p>Dear ${user.name || user.username},</p>
<p>Thank you for registering with EDUHUB! To activate your account, please click the link below:</p>
<p><a href="${verificationUrl}">Verify Email Address</a></p>
<p>This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
<p>Best regards,<br>EDUHUB Team</p>
`;

      try {
        const transporter = createTransporter();
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Verify Your Email - EDUHUB",
          html: verificationMessage,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue with registration even if email fails
      }

      res.status(201).json({
        _id: user._id,
        name: user.name || user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        message:
          "Registration successful! Please check your email to verify your account.",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Authenticate user and get token
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = user.comparePassword
      ? await user.comparePassword(password)
      : await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name || user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
};

// @desc    Get total user count
// @route   GET /api/auth/users/count
// @access  Private
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error("Get user count error:", error);
    res.status(500).json({
      message: "Server error getting user count",
      error: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email message
    const message = `
<h2>Password Reset Request</h2>
<p>Dear ${user.name || user.username},</p>
<p>We received a request to reset your EDUHUB account password. Please click the link below to continue:</p>
<p><a href="${resetUrl}">Reset Password</a></p>
<p>This link will expire in 10 minutes. If you didn't request this action, please ignore this email.</p>
<p>Best regards,<br>EDUHUB Security Team</p>
`;

    // Send email
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset - EDUHUB",
      html: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error during password reset request",
      error: error.message,
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Send confirmation email
    const message = `
<h2>Password Reset Successful</h2>
<p>Dear ${user.name || user.username},</p>
<p>This email confirms that your EDUHUB account password has been successfully reset.</p>
<p>If you did not perform this action, please contact our support team immediately to secure your account.</p>
<p>Best regards,<br>EDUHUB Security Team</p>
`;

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Successful - EDUHUB",
      html: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      message: "Server error during email verification",
      error: error.message,
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const verificationMessage = `
<h2>Verify Your Email Address</h2>
<p>Dear ${user.name || user.username},</p>
<p>Please verify your email address to activate your EDUHUB account by clicking the link below:</p>
<p><a href="${verificationUrl}">Verify Email Address</a></p>
<p>This verification link will expire in 24 hours.</p>
<p>Best regards,<br>EDUHUB Team</p>
`;

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your Email - EDUHUB",
      html: verificationMessage,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Verification email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Server error while resending verification email",
      error: error.message,
    });
  }
};
