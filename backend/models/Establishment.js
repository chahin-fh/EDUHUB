const mongoose = require("mongoose");

const establishmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["university", "school", "college", "training_center", "other"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "Tunisia" },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      website: { type: String },
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    programs: [
      {
        name: { type: String, required: true },
        level: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String },
      },
    ],
    facilities: [
      {
        name: { type: String, required: true },
        description: { type: String },
      },
    ],
    accreditation: {
      isAccredited: { type: Boolean, default: false },
      accreditationBody: { type: String },
      accreditationNumber: { type: String },
      validUntil: { type: Date },
    },
    socialMedia: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      instagram: { type: String },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
establishmentSchema.index({
  name: "text",
  description: "text",
  "address.city": "text",
});

// Virtual for average rating calculation
establishmentSchema.virtual("averageRating").get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

const Establishment = mongoose.model("Establishment", establishmentSchema);

module.exports = Establishment;
