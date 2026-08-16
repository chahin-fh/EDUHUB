const { contactNotificationEmail } = require("../config/emailTemplates");
const { createTransporter } = require("./authController");

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
        message: "Veuillez fournir votre nom, votre email et un message",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir une adresse email valide",
      });
    }

    // Destinataire : CONTACT_EMAIL > EMAIL_USER > email par défaut
    const recipient =
      process.env.CONTACT_EMAIL ||
      process.env.EMAIL_USER ||
      "malekfhima1@gmail.com";

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({
        success: false,
        message:
          "Le service d'envoi d'email n'est pas configuré (EMAIL_USER / EMAIL_PASS manquants).",
      });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      replyTo: email,
      subject: subject
        ? `📩 [${subject}] Nouveau message de contact – ${name}`
        : `📩 Nouveau message de contact – ${name}`,
      html: contactNotificationEmail({ name, email, subject, phone, message }),
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("=== EMAIL SENT SUCCESSFULLY ===");
    console.log("To:", recipient);
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
