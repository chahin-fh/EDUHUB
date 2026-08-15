const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "../uploads");
const documentsDir = path.join(uploadsDir, "documents");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configuration du stockage local pour les documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, documentsDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Types de fichiers autorisés
const allowedMimeTypes = [
  // PDF
  "application/pdf",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Access
  "application/vnd.ms-access",
  "application/x-msaccess",
];

// Middleware pour l'upload de documents
const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: function (req, file, cb) {
    // Vérifier que le fichier est d'un type autorisé
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Type de fichier non autorisé. Types acceptés: PDF, PowerPoint, Word, Excel, Access"
        ),
        false
      );
    }
  },
});

// Configuration du stockage local pour les avatars
const avatarsDir = path.join(uploadsDir, "avatars");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuration du stockage local pour les pièces jointes de chat
const chatDir = path.join(uploadsDir, "chat");

if (!fs.existsSync(chatDir)) {
  fs.mkdirSync(chatDir, { recursive: true });
}

const chatStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, chatDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "chat-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Types de fichiers autorisés pour les pièces jointes de chat
const allowedChatMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",

  // PDF
  "application/pdf",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Texte, archives, JSON
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/json",
];

// Middleware pour l'upload de pièces jointes de chat
const uploadChatFile = multer({
  storage: chatStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: function (req, file, cb) {
    // Vérifier que le fichier est d'un type autorisé
    if (allowedChatMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error("Type de fichier non autorisé");
      error.status = 400;
      cb(error, false);
    }
  },
});

// Types d'images autorisés
const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Middleware pour l'upload d'avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Vérifier que le fichier est une image autorisée
    if (allowedImageMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        "Type de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP, GIF"
      );
      error.status = 400;
      cb(error, false);
    }
  },
});

module.exports = {
  uploadDocument,
  uploadAvatar,
  uploadChatFile,
};
