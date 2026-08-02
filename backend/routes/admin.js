const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { adminOnly } = protect;
const {
  getUserById,
  updateUser,
  deleteUser,
  getReviews,
  deleteReview,
  // getPayments, // ⚠️ Partie paiement commentée
  getActivity,
} = require("../controllers/adminController");

// Toutes les routes admin sont réservées aux administrateurs
router.use(protect, adminOnly);

// @desc    Détail d'un utilisateur (admin)
// @route   GET /api/admin/users/:id
router.get("/users/:id", getUserById);

// @desc    Mettre à jour un utilisateur (suspendre, promouvoir, vérifier)
// @route   PATCH /api/admin/users/:id
router.patch("/users/:id", updateUser);

// @desc    Supprimer / désactiver un utilisateur
// @route   DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

// @desc    Liste des avis (modération)
// @route   GET /api/admin/reviews
router.get("/reviews", getReviews);

// @desc    Supprimer un avis (modération)
// @route   DELETE /api/admin/reviews/:id
router.delete("/reviews/:id", deleteReview);

// ⚠️ Route des paiements admin commentée (partie paiement désactivée)
// router.get("/payments", getPayments);

// @desc    Journal d'activité admin
// @route   GET /api/admin/activity
router.get("/activity", getActivity);

module.exports = router;
