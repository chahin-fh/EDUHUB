const nodemailer = require("nodemailer");

// @desc    Send contact form message
// @route   POST /api/contact
// @access  Public
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

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
  from: `"EDUHUB Contact" <${email}>`,
  to: "malekfhima1@gmail.com",
  subject: `📩 Nouveau message de contact – ${name}`,
  html: `
    <div style="background-color:#f4f6f8; padding:40px 0; font-family:Arial, Helvetica, sans-serif;">
      
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed); padding:25px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">
            📬 New Contact Message
          </h1>
          <p style="color:#e0e7ff; margin:5px 0 0; font-size:14px;">
            EDUHUB Platform
          </p>
        </div>

        <!-- Content -->
        <div style="padding:30px;">
          <p style="font-size:15px; color:#333;">
            You have received a new message from the <strong>EDUHUB contact form</strong>.
          </p>

          <div style="margin-top:25px;">
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr>
                <td style="padding:8px 0; color:#555;"><strong>👤 Name:</strong></td>
                <td style="padding:8px 0; color:#111;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#555;"><strong>📧 Email:</strong></td>
                <td style="padding:8px 0; color:#111;">${email}</td>
              </tr>
              ${
                phone
                  ? `
              <tr>
                <td style="padding:8px 0; color:#555;"><strong>📞 Phone:</strong></td>
                <td style="padding:8px 0; color:#111;">${phone}</td>
              </tr>
              `
                  : ""
              }
            </table>
          </div>

          <!-- Message box -->
          <div style="margin-top:25px;">
            <p style="font-weight:bold; color:#333; margin-bottom:8px;">💬 Message:</p>
            <div style="background:#f9fafb; border-left:4px solid #6366f1; padding:15px; border-radius:6px; color:#333; line-height:1.6;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>

          <!-- Action button -->
          <div style="text-align:center; margin-top:30px;">
            <a href="mailto:${email}" 
               style="display:inline-block; padding:12px 22px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:999px; font-size:14px;">
              Reply to ${name}
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#666;">
          <p style="margin:4px 0;">
            This email was automatically generated from the EDUHUB contact form.
          </p>
          <p style="margin:4px 0;">
            🕒 Sent on: ${new Date().toLocaleString()}
          </p>
        </div>

      </div>
    </div>
  `,
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
