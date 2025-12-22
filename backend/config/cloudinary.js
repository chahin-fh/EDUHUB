const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage pour images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduhub/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 675, crop: "limit" }],
  },
});

// Storage pour vidéos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduhub/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi"],
  },
});

// Storage pour documents
const docStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduhub/documents",
    resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx", "ppt", "pptx"],
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadMultiple = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  uploadDoc,
  uploadMultiple,
};
