/* =====================================================================
   ⚠️ PARTIE PAIEMENT — CODE COMMENTÉ (routes /api/payment)
   ---------------------------------------------------------------------
   La partie paiement a été mise en commentaire sur demande.
   Pour réactiver : retirez les marqueurs de commentaire ci-dessous
   et réactivez le montage dans index.js (app.use("/api/payment", ...)).
   ===================================================================== */

/*
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const requireEmailVerification = require("../middleware/emailVerification");
const {
  createCheckoutSession,
  getPaymentHistory,
} = require("../controllers/paymentController");

// Protégé : créer une session de paiement (email vérifié requis)
router.post(
  "/create-checkout-session",
  protect,
  requireEmailVerification,
  createCheckoutSession
);

// Protégé : historique des paiements de l'utilisateur connecté
router.get("/history", protect, getPaymentHistory);

module.exports = router;
*/
