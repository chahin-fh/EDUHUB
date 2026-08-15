const nodemailer = require("nodemailer");
const { contactNotificationEmail } = require("../config/emailTemplates");

// @desc    Send contact form message
// @route   POST /api/contact
// @access  Public
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and message",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"EDUHUB Contact" <${process.env.EMAIL_USER}>`,
      to: "malekfhima1@gmail.com",
      replyTo: email,
      subject: subject
        ? `📩 [${subject}] Nouveau message de contact – ${name}`
        : `📩 Nouveau message de contact – ${name}`,
      html: contactNotificationEmail({ name, email, subject, phone, message }),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log pour suivi
    console.log("=== EMAIL SENT SUCCESSFULLY ===");
    console.log("To: malekfhima1@gmail.com");
    console.log("From:", email);
    console.log("Subject:", `New Contact Form Message from ${name}`);
    console.log("===============================");

    res.status(200).json({
      success: true,
      message: "Message sent successfully! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Error sending contact email:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

module.exports = {
  sendContactMessage,
};
