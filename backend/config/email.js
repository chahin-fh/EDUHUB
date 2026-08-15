const nodemailer = require("nodemailer");
const { renderEmail } = require("./emailTemplates");

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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const emailTemplates = {
  welcome: (name) =>
    renderEmail({
      preheader: "Bienvenue sur EDUHUB !",
      title: "Bienvenue sur EDUHUB",
      greeting: `Bonjour ${name},`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Votre compte a été créé avec succès. Nous sommes ravis de vous compter parmi nous&nbsp;!</p>
        <p style="margin:0 0 14px;">Explorez les matières, trouvez des mentors et commencez à apprendre dès aujourd'hui.</p>
      `,
      buttonLabel: "Explorer EDUHUB",
      buttonUrl: FRONTEND_URL,
    }),

  enrollmentSuccess: (name, courseTitle) =>
    renderEmail({
      preheader: "Inscription confirmée au cours",
      title: "Inscription confirmée",
      greeting: `Bonjour ${name},`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Vous êtes maintenant inscrit au cours&nbsp;: <strong>${courseTitle}</strong>.</p>
        <p style="margin:0 0 14px;">Bon apprentissage&nbsp;!</p>
      `,
      buttonLabel: "Accéder à mes cours",
      buttonUrl: `${FRONTEND_URL}/my-courses`,
    }),

  certificateEarned: (name, courseTitle, certificateUrl) =>
    renderEmail({
      preheader: `Félicitations ${name} !`,
      title: "Félicitations 🎉",
      greeting: `Félicitations ${name},`,
      bodyHtml: `
        <p style="margin:0 0 14px;">Vous avez terminé le cours&nbsp;: <strong>${courseTitle}</strong>.</p>
        <p style="margin:0 0 14px;">Téléchargez votre certificat ci-dessous pour célébrer cette réussite&nbsp;!</p>
      `,
      buttonLabel: "Télécharger le certificat",
      buttonUrl: certificateUrl,
    }),
};

module.exports = { sendEmail, emailTemplates };
