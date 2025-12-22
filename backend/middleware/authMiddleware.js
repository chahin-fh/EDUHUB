const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Access is restricted to administrators" });
  }

  return next();
}

function monitorOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Admin has all privileges
  if (req.user.role === "admin" || req.user.isMonitor) {
    return next();
  }

  return res
    .status(403)
    .json({ message: "Forbidden: Monitor access required" });
}

function adminOrMonitorOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Only admin or monitors can access
  if (req.user.role === "admin" || req.user.isMonitor) {
    return next();
  }

  return res
    .status(403)
    .json({ message: "Forbidden: Admin or Monitor access required" });
}

module.exports = protect;
module.exports.adminOnly = adminOnly;
module.exports.monitorOnly = monitorOnly;
module.exports.adminOrMonitorOnly = adminOrMonitorOnly;
