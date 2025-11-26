const Course = require("../models/Course");
const fs = require("fs");
const path = require("path");

// @desc    Upload a new course with PDF
// @route   POST /api/courses/upload
// @access  Private
exports.uploadCourse = async (req, res) => {
  try {
    const { courseName, description } = req.body;
    const user = req.user;

    // Validation
    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ message: "Course name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Validate file type
    if (req.file.mimetype !== "application/pdf") {
      // Delete uploaded file if not PDF
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return res.status(400).json({ message: "Only PDF files are allowed" });
    }

    // Create course document
    const course = await Course.create({
      courseName: courseName.trim(),
      description: description ? description.trim() : "",
      pdfFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      uploadedBy: user._id,
      uploader: {
        username: user.username,
        email: user.email,
      },
    });

    res.status(201).json({
      success: true,
      message: "Course uploaded successfully",
      course: {
        _id: course._id,
        courseName: course.courseName,
        description: course.description,
        uploadedBy: course.uploader.username,
        uploadedAt: course.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload course error:", error);

    // Clean up uploaded file in case of error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      message: "Error uploading course",
      error: error.message,
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "active" })
      .populate("uploadedBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "uploadedBy",
      "username email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      message: "Error fetching course",
      error: error.message,
    });
  }
};

// @desc    Download course PDF
// @route   GET /api/courses/:id/download
// @access  Public
exports.downloadCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || !course.pdfFile) {
      return res.status(404).json({ message: "Course or PDF not found" });
    }

    const filePath = course.pdfFile.path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, course.pdfFile.originalName, (err) => {
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("Download course error:", error);
    res.status(500).json({
      message: "Error downloading course",
      error: error.message,
    });
  }
};

// @desc    Delete course (only by uploader or admin)
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the uploader or admin
    if (
      course.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    // Delete PDF file from server
    if (course.pdfFile && course.pdfFile.path) {
      fs.unlink(course.pdfFile.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      message: "Error deleting course",
      error: error.message,
    });
  }
};
