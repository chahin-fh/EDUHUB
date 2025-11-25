const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

<<<<<<< HEAD
const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, select: false },
    avatar: { type: String },
  },
  {
    timestamps: true,
  }
);
=======
const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, {
  timestamps: true,
});
>>>>>>> 30fbff93f9fe6dd7e7bd59b2c37c0b91a77335b2

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
ù