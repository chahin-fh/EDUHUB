// Templates d'emails professionnels pour EDUHUB
// Layout responsive (table + styles inline) compatible avec la plupart des clients de messagerie.

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const CONTACT_EMAIL = process.env.EMAIL_USER || "malekfhima1@gmail.com";

// Échappe le contenu utilisateur pour éviter toute injection HTML dans les emails
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Layout principal réutilisable pour tous les emails
function renderEmail({
  preheader = "",
  title = "",
  greeting = "",
  bodyHtml = "",
  buttonLabel = "",
  buttonUrl = "",
  note = "",
}) {
  const button =
    buttonLabel && buttonUrl
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td align="center">
            <a href="${buttonUrl}" style="display:inline-block; padding:14px 34px; background:linear-gradient(135deg,#2563eb,#7c3aed); color:#ffffff; text-decoration:none; border-radius:999px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold;">
              ${buttonLabel}
            </a>
          </td>
        </tr>
      </table>`
      : "";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial,Helvetica,sans-serif;">
  ${
    preheader
      ? `<div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">${preheader}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#7c3aed); padding:30px 32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px; letter-spacing:0.5px; font-family:Arial,Helvetica,sans-serif;">EDU<span style="color:#a5b4fc;">HUB</span></h1>
              <p style="margin:6px 0 0; color:#e0e7ff; font-size:13px; font-family:Arial,Helvetica,sans-serif;">Apprentissage Pair-à-Pair</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:32px 32px 0;">
              <h2 style="margin:0 0 16px; color:#1f2937; font-size:20px; line-height:1.35; font-family:Arial,Helvetica,sans-serif;">${title}</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:0 32px 8px; color:#374151; font-size:15px; line-height:1.7; font-family:Arial,Helvetica,sans-serif;">
              ${greeting ? `<p style="margin:0 0 14px;">${greeting}</p>` : ""}
              ${bodyHtml}
              ${button}
            </td>
          </tr>

          ${
            note
              ? `
          <!-- Note -->
          <tr>
            <td style="padding:8px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-left:4px solid #c7d2fe; border-radius:6px;">
                <tr>
                  <td style="padding:14px 16px; color:#6b7280; font-size:13px; line-height:1.6; font-family:Arial,Helvetica,sans-serif;">
                    ${note}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:22px 32px; text-align:center; border-top:1px solid #eef2f7;">
              <p style="margin:0 0 6px; color:#6b7280; font-size:12px; font-family:Arial,Helvetica,sans-serif;">
                <a href="${FRONTEND_URL}" style="color:#2563eb; text-decoration:none; font-weight:bold;">EDUHUB</a>
                &nbsp;·&nbsp;
                <a href="mailto:${CONTACT_EMAIL}" style="color:#6b7280; text-decoration:none;">${CONTACT_EMAIL}</a>
              </p>
              <p style="margin:0; color:#9ca3af; font-size:11px; font-family:Arial,Helvetica,sans-serif;">© ${new Date().getFullYear()} EDUHUB. Tous droits réservés.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Emails d'authentification ---

// Vérification d'email (inscription & renvoi)
function verificationEmail(name, url) {
  return renderEmail({
    preheader: "Confirmez votre adresse email pour activer votre compte EDUHUB.",
    title: "Vérification de votre adresse email",
    greeting: `Bonjour ${escapeHtml(name)},`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Merci de vous être inscrit sur <strong>EDUHUB</strong>, votre plateforme d'apprentissage pair-à-pair&nbsp;!</p>
      <p style="margin:0 0 14px;">Pour activer votre compte et profiter de toutes les fonctionnalités, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>
      <p style="margin:0 0 14px; color:#6b7280; font-size:13px;">⏳ Ce lien de vérification expirera dans <strong>24 heures</strong>.</p>
    `,
    buttonLabel: "Vérifier mon adresse email",
    buttonUrl: url,
    note: "Si vous n'avez pas créé de compte sur EDUHUB, vous pouvez ignorer cet email en toute sécurité.",
  });
}

// Réinitialisation de mot de passe
function passwordResetEmail(name, url) {
  return renderEmail({
    preheader: "Réinitialisez votre mot de passe EDUHUB. Ce lien expire dans 10 minutes.",
    title: "Réinitialisation de votre mot de passe",
    greeting: `Bonjour ${escapeHtml(name)},`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Nous avons reçu une demande de réinitialisation du mot de passe de votre compte <strong>EDUHUB</strong>.</p>
      <p style="margin:0 0 14px;">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe&nbsp;:</p>
      <p style="margin:0 0 14px; color:#6b7280; font-size:13px;">⏳ Ce lien expirera dans <strong>10 minutes</strong>.</p>
    `,
    buttonLabel: "Réinitialiser mon mot de passe",
    buttonUrl: url,
    note: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Votre mot de passe actuel reste inchangé.",
  });
}

// Confirmation de réinitialisation de mot de passe
function passwordResetConfirmationEmail(name) {
  return renderEmail({
    preheader: "Votre mot de passe EDUHUB a été réinitialisé avec succès.",
    title: "Mot de passe réinitialisé",
    greeting: `Bonjour ${escapeHtml(name)},`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Cet email confirme que le mot de passe de votre compte <strong>EDUHUB</strong> a bien été réinitialisé.</p>
      <p style="margin:0 0 14px;">Si vous n'êtes pas à l'origine de cette action, contactez immédiatement notre équipe de support pour sécuriser votre compte.</p>
    `,
    buttonLabel: "Se connecter à EDUHUB",
    buttonUrl: `${FRONTEND_URL}/connexion`,
  });
}

// --- Email de notification (formulaire de contact) ---

function contactNotificationEmail({ name, email, subject, phone, message }) {
  const rows = `
    <tr>
      <td style="padding:10px 0; color:#6b7280; font-size:13px; width:110px;"><strong>Nom :</strong></td>
      <td style="padding:10px 0; color:#111827; font-size:14px;">${escapeHtml(name)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0; color:#6b7280; font-size:13px; width:110px;"><strong>Email :</strong></td>
      <td style="padding:10px 0; color:#111827; font-size:14px;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb; text-decoration:none;">${escapeHtml(email)}</a></td>
    </tr>
    ${
      subject
        ? `
    <tr>
      <td style="padding:10px 0; color:#6b7280; font-size:13px; width:110px;"><strong>Sujet :</strong></td>
      <td style="padding:10px 0; color:#111827; font-size:14px;">${escapeHtml(subject)}</td>
    </tr>`
        : ""
    }
    ${
      phone
        ? `
    <tr>
      <td style="padding:10px 0; color:#6b7280; font-size:13px; width:110px;"><strong>Téléphone :</strong></td>
      <td style="padding:10px 0; color:#111827; font-size:14px;">${escapeHtml(phone)}</td>
    </tr>`
        : ""
    }
  `;

  return renderEmail({
    preheader: `Nouveau message de contact de ${name}`,
    title: "📬 Nouveau message de contact",
    greeting: "Bonjour,",
    bodyHtml: `
      <p style="margin:0 0 14px;">Vous avez reçu un nouveau message via le formulaire de contact <strong>EDUHUB</strong>.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border:1px solid #eef2f7; border-radius:8px; margin:0 0 8px;">
        ${rows}
      </table>
      <p style="margin:18px 0 8px; color:#111827; font-size:14px; font-weight:bold;">💬 Message :</p>
      <div style="background:#f9fafb; border-left:4px solid #6366f1; padding:14px 16px; border-radius:6px; color:#374151; font-size:14px; line-height:1.7;">
        ${escapeHtml(message).replace(/\n/g, "<br>")}
      </div>
    `,
    buttonLabel: `Répondre à ${escapeHtml(name)}`,
    buttonUrl: `mailto:${escapeHtml(email)}`,
    note: "Cet email a été envoyé automatiquement depuis le formulaire de contact du site EDUHUB.",
  });
}

module.exports = {
  renderEmail,
  verificationEmail,
  passwordResetEmail,
  passwordResetConfirmationEmail,
  contactNotificationEmail,
};
