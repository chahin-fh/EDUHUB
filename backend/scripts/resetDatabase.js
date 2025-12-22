const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
require("dotenv").config();

async function resetDatabase() {
  try {
    console.log("Connexion à la base de données...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/"
    );

    console.log("Suppression des utilisateurs existants...");
    await User.deleteMany({});

    console.log("Suppression des cours existants...");
    await Course.deleteMany({});

    console.log("Création de l'administrateur par défaut...");
    const adminUser = new User({
      username: "admin",
      name: "Administrateur",
      email: "admin@eduhub.com",
      password: "admin123",
      role: "admin",
      isMonitor: true,
      emailVerified: true,
      isActive: true,
    });
    await adminUser.save();

    console.log("Création d'un utilisateur test...");
    const testUser = new User({
      username: "testuser",
      name: "Utilisateur Test",
      email: "user@eduhub.com",
      password: "user123",
      role: "user",
      isMonitor: false,
      emailVerified: true,
      isActive: true,
    });
    await testUser.save();

    console.log("Base de données réinitialisée avec succès!");
    console.log("Admin: admin@eduhub.com / admin123");
    console.log("User: user@eduhub.com / user123");
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetDatabase();
