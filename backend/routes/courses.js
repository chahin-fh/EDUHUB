const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const requireEmailVerification = require("../middleware/emailVerification");
const protectMiddleware = require("../middleware/authMiddleware");
const { monitorOnly } = protectMiddleware;
const { uploadVideo } = require("../config/cloudinary");
const { uploadDocument } = require("../config/multer");
const Course = require("../models/Course");
const {
  getAllCourses,
  getCourseById: getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyCourses,
  getInstructorCourses,
  updateProgress,
  uploadCourse,
  downloadCourse,
} = require("../controllers/courseController");

// Routes publiques
router.get("/", getAllCourses);
router.get("/:id([0-9a-fA-F]{24})", getCourse);

// Téléchargement : réservé aux étudiants inscrits au cours (ou créateur/admin)
router.get(
  "/:id([0-9a-fA-F]{24})/download",
  protect,
  requireEmailVerification,
  downloadCourse
);

// Upload de cours (document) — réservé aux moniteurs & admins
router.post(
  "/upload",
  protect,
  requireEmailVerification,
  monitorOnly,
  uploadDocument.single("document"),
  uploadCourse
);

// Routes protégées (authentification requise)
router.use(protect);
router.use(requireEmailVerification);

// Étudiants
router.post("/:id([0-9a-fA-F]{24})/enroll", enrollCourse);
router.get("/my/enrolled", getMyCourses);
router.patch("/:id([0-9a-fA-F]{24})/progress", updateProgress);

// Moniteurs & admins (le rôle "instructor" n'existe pas : monitorOnly vérifie isMonitor || admin)
router.get("/instructor/my-courses", monitorOnly, getInstructorCourses);
router.post(
  "/:id([0-9a-fA-F]{24})/upload-video",
  monitorOnly,
  uploadVideo.single("video"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        course.instructor?.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      course.previewVideo = req.file.path;
      await course.save();

      res.json({
        success: true,
        url: req.file.path,
        duration: req.file.duration,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
router.post("/", monitorOnly, createCourse);
router.patch("/:id([0-9a-fA-F]{24})", monitorOnly, updateCourse);
router.delete("/:id([0-9a-fA-F]{24})", monitorOnly, deleteCourse);

module.exports = router;
