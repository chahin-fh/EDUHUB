const mongoose = require("mongoose");

const courseReviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Un étudiant ne peut laisser qu'un seul avis par cours
courseReviewSchema.index({ course: 1, user: 1 }, { unique: true });
courseReviewSchema.index({ course: 1, createdAt: -1 });

const CourseReview = mongoose.model("CourseReview", courseReviewSchema);

module.exports = CourseReview;
