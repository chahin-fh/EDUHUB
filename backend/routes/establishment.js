const express = require("express");
const router = express.Router();
const {
  getEstablishments,
  getEstablishment,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  addReview,
  uploadImages,
  getEstablishmentStats,
} = require("../controllers/establishmentController");

const protect = require("../middleware/authMiddleware");
const { adminOnly } = protect;
const { uploadMultiple } = require("../config/cloudinary");

// Public routes
router.get("/", getEstablishments);
router.get("/stats", protect, adminOnly, getEstablishmentStats);
router.get("/:id", getEstablishment);

// Private routes
router.post("/:id/reviews", protect, addReview);

// Admin routes
router.post("/", protect, adminOnly, createEstablishment);
router.put("/:id", protect, adminOnly, updateEstablishment);
router.delete("/:id", protect, adminOnly, deleteEstablishment);
router.post(
  "/:id/images",
  protect,
  adminOnly,
  uploadMultiple.array("images", 5),
  uploadImages
);

module.exports = router;
