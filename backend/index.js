const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
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
    path: path.resolve(__dirname, ".env"),
    override: true,
});

// Passport Config
require("./config/passport")(passport);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: corsOptions,
});

// Socket.io for Signaling
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("call-user", (data) => {
        // data: { to, from, signalData, fromName, fromAvatar, isScreenShare }
        console.log(`Calling user ${data.to} from ${data.from}`);
        io.to(data.to).emit("incoming-call", {
            signal: data.signalData,
            from: data.from,
            fromName: data.fromName,
            fromAvatar: data.fromAvatar,
            isScreenShare: data.isScreenShare,
        });
    });

    socket.on("accept-call", (data) => {
        // data: { to, signalData }
        console.log(`Call accepted by ${socket.id}, sending to ${data.to}`);
        io.to(data.to).emit("call-accepted", data.signalData);
    });

    socket.on("end-call", (data) => {
        // data: { to }
        console.log(`Ending call for ${data.to}`);
        io.to(data.to).emit("call-ended");
    });

    socket.on("ice-candidate", (data) => {
        // data: { to, candidate }
        console.log(`Sending ICE candidate to ${data.to}`);
        io.to(data.to).emit("ice-candidate", data.candidate);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);

// Stripe webhook (doit être AVANT bodyParser pour recevoir le body brut / signature)
const paymentController = require("./controllers/paymentController");
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), paymentController.webhookCheckout);

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
            "mongodb://localhost:27017/EDUHUB",
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
const matchingRoutes = require("./routes/matching");
const reviewsRoutes = require("./routes/reviews");
const paymentRoutes = require("./routes/payment");
const statsRoutes = require("./routes/stats");

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
app.use("/api/matching", matchingRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/stats", statsRoutes);

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
server.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
});