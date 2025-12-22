const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
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
router.post(
  "/upload",
  protect,
  uploadDocument.single("document"),
  uploadCourse
);
router.get("/:id([0-9a-fA-F]{24})/download", downloadCourse);

// Routes protégées (authentification requise)
router.use(protect);

// Étudiants
router.post("/:id([0-9a-fA-F]{24})/enroll", enrollCourse);
router.get("/my/enrolled", getMyCourses);
router.patch("/:id([0-9a-fA-F]{24})/progress", updateProgress);

// Instructeurs
router.get(
  "/instructor/my-courses",
  restrictTo("instructor", "admin"),
  getInstructorCourses
);
router.post(
  "/:id([0-9a-fA-F]{24})/upload-video",
  restrictTo("instructor", "admin"),
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
router.post("/", restrictTo("instructor", "admin"), createCourse);
router.patch(
  "/:id([0-9a-fA-F]{24})",
  restrictTo("instructor", "admin"),
  updateCourse
);
router.delete(
  "/:id([0-9a-fA-F]{24})",
  restrictTo("instructor", "admin"),
  deleteCourse
);

module.exports = router;
