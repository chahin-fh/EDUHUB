const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const {
  helmet,
  limiter,
  authLimiter,
  corsOptions,
  cors,
} = require("./middleware/security");

// Load environment variables from the root .env file
require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
  override: true,
});

// Passport Config
require("./config/passport")(passport);

const app = express();

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a-super-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database connection
const connectDB = async () => {
  try {
    const candidates = [
      process.env.MONGODB_URI,
      process.env.MONGO_URL,
      "mongodb://localhost:27017/test",
    ].filter(Boolean);

    if (candidates.length === 0) {
      throw new Error("Missing MONGODB_URI or MONGO_URL environment variable");
    }

    let lastError;
    for (const uri of candidates) {
      try {
        await mongoose.connect(uri);
        console.log("✓ Connected to MongoDB successfully");
        return;
      } catch (err) {
        lastError = err;
        console.error("✗ MongoDB connection failed for URI:", uri);
        console.error("  ", err.message);
      }
    }

    throw lastError || new Error("Unable to connect to MongoDB");
  } catch (error) {
    console.error("✗ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

connectDB();

const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");
const establishmentRoutes = require("./routes/establishment");
const mentorsRoutes = require("./routes/mentors");
const usersRoutes = require("./routes/users");
const monitorRoutes = require("./routes/monitor");
const usersListRoutes = require("./routes/usersList");
const contactRoutes = require("./routes/contact");
const chatRoutes = require("./routes/chat");

app.use("/api/subjects", require("./routes/subjects"));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/establishments", establishmentRoutes);
app.use("/api/mentors", mentorsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/usersList", usersListRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
app.use("/uploads/documents", express.static("uploads/documents"));

app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
});
