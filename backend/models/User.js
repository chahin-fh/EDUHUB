const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const expertiseSubjectSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  level: {
    type: String,
    enum: ["Débutant", "Intermédiaire", "Avancé"],
    default: "Intermédiaire",
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const learningGoalSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  level: {
    type: String,
    enum: ["Débutant", "Intermédiaire", "Avancé"],
    default: "Débutant",
  },
}, { _id: false });

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  },
  startTime: String,
  endTime: String,
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    name: {
      type: String,
      required: function () {
        return !this.username;
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatar: String,
    bio: String,

    // --- Coordonnées du profil ---
    firstName: String,
    lastName: String,
    phone: String,
    birthdate: String,
    city: String,
    country: String,
    github: String,
    linkedin: String,

    // --- Peer-to-peer learning fields ---

    // What the user wants to learn
    learningGoals: [learningGoalSchema],

    // Moniteur capabilities (peut être activé pour les users)
    // Par défaut false : un nouvel utilisateur n'est PAS moniteur tant qu'il
    // n'active pas ce statut (POST /api/monitor/toggle) ou n'ajoute pas d'expertise.
    isMonitor: {
      type: Boolean,
      default: false,
    },
    monitorProfile: {
      expertise: [expertiseSubjectSchema],
      verified: {
        type: Boolean,
        default: false,
      },
      rating: {
        type: Number,
        default: 0,
      },
      ratingsCount: {
        type: Number,
        default: 0,
      },
      coursesCreated: {
        type: Number,
        default: 0,
      },
    },

    // Availability (optional v1)
    availability: [availabilitySlotSchema],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Reset password
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Dates
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("validate", function (next) {
  if (!this.name && this.username) {
    this.name = this.username;
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
