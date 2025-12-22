const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const fs = require("fs");
const path = require("path");

// @desc    Upload a new course with document
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
      return res.status(400).json({ message: "Document file is required" });
    }

    // Create course document
    const course = await Course.create({
      title: courseName.trim(), // Required field
      courseName: courseName.trim(), // Legacy field
      description: description ? description.trim() : "",
      documentFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      uploadedBy: user._id,
      uploader: {
        username: user.username || user.name,
        email: user.email,
      },
      status: "published", // Use published instead of active
      price: 0, // Free course by default
      category: "Autre", // Default category
      level: "Débutant", // Default level
      language: "fr", // Use 'fr' instead of 'Français'
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

// @desc    Get single course by ID (new route alias)
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  return exports.getCourseById(req, res);
};

// @desc    Create a course (instructor/admin)
// @route   POST /api/courses
// @access  Private (instructor/admin)
exports.createCourse = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.instructor = req.user._id;

    const course = await Course.create(payload);
    return res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Create course error:", error);
    return res
      .status(500)
      .json({ message: "Error creating course", error: error.message });
  }
};

// @desc    Update a course (instructor/admin)
// @route   PATCH /api/courses/:id
// @access  Private (instructor/admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (
      course.instructor?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    Object.assign(course, req.body);
    await course.save();

    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Update course error:", error);
    return res
      .status(500)
      .json({ message: "Error updating course", error: error.message });
  }
};

// @desc    Delete a course (instructor/admin)
// @route   DELETE /api/courses/:id
// @access  Private (instructor/admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (
      course.instructor?.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    if (course.pdfFile && course.pdfFile.path) {
      fs.unlink(course.pdfFile.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id });

    return res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    return res
      .status(500)
      .json({ message: "Error deleting course", error: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (student)
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: req.params.id },
      {
        $setOnInsert: {
          student: req.user._id,
          course: req.params.id,
          paymentStatus: "completed",
          status: "active",
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, enrollment });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(200)
        .json({ success: true, message: "Already enrolled" });
    }
    console.error("Enroll course error:", error);
    return res
      .status(500)
      .json({ message: "Error enrolling course", error: error.message });
  }
};

// @desc    Get my enrolled courses
// @route   GET /api/courses/my/enrolled
// @access  Private
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: { $in: ["active", "completed"] },
    })
      .populate("course")
      .sort({ enrolledAt: -1 });

    return res
      .status(200)
      .json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    console.error("Get my courses error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching enrollments", error: error.message });
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (instructor/admin)
exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({
      createdAt: -1,
    });
    return res
      .status(200)
      .json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    return res.status(500).json({
      message: "Error fetching instructor courses",
      error: error.message,
    });
  }
};

// @desc    Update course progress
// @route   PATCH /api/courses/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { moduleId, lessonId, completed, timeSpent } = req.body;
    if (!moduleId || !lessonId) {
      return res
        .status(400)
        .json({ message: "moduleId and lessonId are required" });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id,
    });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const existing = enrollment.progress.find(
      (p) =>
        p.moduleId?.toString() === moduleId &&
        p.lessonId?.toString() === lessonId
    );

    if (existing) {
      if (typeof completed === "boolean") {
        existing.completed = completed;
        existing.completedAt = completed ? new Date() : undefined;
      }
      if (typeof timeSpent === "number") {
        existing.timeSpent = (existing.timeSpent || 0) + timeSpent;
      }
    } else {
      enrollment.progress.push({
        moduleId,
        lessonId,
        completed: !!completed,
        completedAt: completed ? new Date() : undefined,
        timeSpent: typeof timeSpent === "number" ? timeSpent : undefined,
      });
    }

    enrollment.lastAccessedAt = new Date();

    const course = await Course.findById(req.params.id).select("modules");
    const totalLessons =
      course?.modules?.reduce(
        (acc, m) => acc + (m.lessons ? m.lessons.length : 0),
        0
      ) || 0;
    const completedLessons = enrollment.progress.filter(
      (p) => p.completed
    ).length;

    enrollment.completionPercentage = totalLessons
      ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
      : 0;

    if (enrollment.completionPercentage >= 100) {
      enrollment.status = "completed";
      enrollment.completedAt = enrollment.completedAt || new Date();
    }

    await enrollment.save();
    return res.status(200).json({ success: true, enrollment });
  } catch (error) {
    console.error("Update progress error:", error);
    return res
      .status(500)
      .json({ message: "Error updating progress", error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      status: { $in: ["active", "published"] },
    })
      .populate("uploadedBy", "username name email")
      .populate("instructor", "username name email")
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
      "username name email"
    );

    await course?.populate("instructor", "username name email");

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

// @desc    Download course document
// @route   GET /api/courses/:id/download
// @access  Public
exports.downloadCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check for documentFile first, then pdfFile for backward compatibility
    const fileData = course.documentFile || course.pdfFile;

    if (!fileData) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = fileData.path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, fileData.originalName, (err) => {
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

// @desc    Delete course (legacy PDF flow - kept for backward compatibility)
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourseLegacy = async (req, res) => {
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
