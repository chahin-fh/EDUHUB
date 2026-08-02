/* =====================================================================
   ⚠️ PARTIE PAIEMENT — CODE COMMENTÉ (Stripe)
   ---------------------------------------------------------------------
   La partie paiement a été mise en commentaire sur demande.
   Pour réactiver : retirez les marqueurs de commentaire ci-dessous
   (ainsi que dans paymentController.js, routes/payment.js, index.js,
   et les parties paiement du frontend).
   ===================================================================== */

/*
const stripeKey = process.env.STRIPE_SECRET_KEY;

let stripe;
try {
  if (stripeKey) {
    stripe = require("stripe")(stripeKey);
  } else {
    console.warn(
      "⚠️  STRIPE_SECRET_KEY is not set. Payment features will be unavailable until configured."
    );
    // Proxy récursif : n'importe quel appel (même imbriqué) renvoie une erreur claire
    const createStripeProxy = () =>
      new Proxy(() => Promise.reject(new Error("Stripe n'est pas configuré. Définissez STRIPE_SECRET_KEY dans votre .env")), {
        get(target, prop) {
          if (prop === "then" || prop === "toJSON") return undefined;
          return createStripeProxy();
        },
      });
    stripe = createStripeProxy();
  }
} catch (err) {
  console.error("✗ Failed to initialize Stripe:", err.message);
  stripe = null;
}

module.exports = stripe;
*/