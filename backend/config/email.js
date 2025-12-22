const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `EDUHUB <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// Templates
const emailTemplates = {
  welcome: (name) => `
    <h1>Bienvenue sur EDUHUB, ${name}!</h1>
    <p>Votre compte a été créé avec succès.</p>
  `,

  enrollmentSuccess: (name, courseTitle) => `
    <h1>Inscription confirmée!</h1>
    <p>Bonjour ${name},</p>
    <p>Vous êtes maintenant inscrit au cours: <strong>${courseTitle}</strong></p>
    <a href="${process.env.FRONTEND_URL}/my-courses">Accéder à mes cours</a>
  `,

  certificateEarned: (name, courseTitle, certificateUrl) => `
    <h1>Félicitations ${name}!</h1>
    <p>Vous avez terminé le cours: <strong>${courseTitle}</strong></p>
    <a href="${certificateUrl}">Télécharger le certificat</a>
  `,
};

module.exports = { sendEmail, emailTemplates };
