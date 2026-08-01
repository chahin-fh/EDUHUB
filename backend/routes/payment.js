const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createCheckoutSession,
  getPaymentHistory,
} = require("../controllers/paymentController");

// Protégé : créer une session de paiement
router.post("/create-checkout-session", protect, createCheckoutSession);

// Protégé : historique des paiements de l'utilisateur connecté
router.get("/history", protect, getPaymentHistory);

module.exports = router;
