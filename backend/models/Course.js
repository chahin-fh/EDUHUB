const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "text", "quiz", "assignment"],
    default: "video",
  },
  content: String,
  videoUrl: String,
  duration: Number,
  order: Number,
  isFree: {
    type: Boolean,
    default: false,
  },
  resources: [
    {
      name: String,
      url: String,
      type: String,
    },
  ],
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  order: Number,
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    // New schema
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      required: function () {
        return (
          !(this.documentFile && this.documentFile.path) &&
          !(this.pdfFile && this.pdfFile.path)
        );
      },
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.uploadedBy;
      },
    },

    // Media
    thumbnail: String,
    previewVideo: String,

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discountPrice: Number,
    currency: {
      type: String,
      default: "TND",
    },

    // Category
    category: {
      type: String,
      required: true,
      enum: [
        "Développement Web",
        "Data Science",
        "Design",
        "Business",
        "Marketing",
        "Langues",
        "Autre",
      ],
      default: "Autre",
    },
    subcategory: String,
    tags: [String],

    // Level
    level: {
      type: String,
      enum: ["Débutant", "Intermédiaire", "Avancé"],
      required: true,
      default: "Débutant",
    },

    // Content
    language: {
      type: String,
      default: "Français",
    },
    modules: [moduleSchema],

    // Info
    duration: Number,
    requirements: [String],
    whatYouWillLearn: [String],
    targetAudience: [String],

    // Stats
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived", "active", "inactive", "pending"],
      default: "draft",
    },
    publishedAt: Date,

    // Certificate
    hasCertificate: {
      type: Boolean,
      default: true,
    },

    // Legacy fields (backward compatibility with current document upload flow)
    courseName: {
      type: String,
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },
    pdfFile: {
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    documentFile: {
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    uploader: {
      username: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
courseSchema.index({ title: "text", description: "text", tags: "text" });

// Keep legacy and new fields in sync
courseSchema.pre("validate", function (next) {
  if (!this.title && this.courseName) this.title = this.courseName;
  if (!this.courseName && this.title) this.courseName = this.title;

  if (!this.instructor && this.uploadedBy) this.instructor = this.uploadedBy;
  if (!this.uploadedBy && this.instructor) this.uploadedBy = this.instructor;

  next();
});

// Generate slug before save
courseSchema.pre("save", function (next) {
  if (this.isModified("title") && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
