const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
  override: true,
});

const mongoose = require("mongoose");
const User = require("../models/User");

function getArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const email = getArg("email");
  const password = getArg("password");
  const username = getArg("username") || "admin";
  const name = getArg("name") || "Administrateur";

  if (!email || !password) {
    console.error(
      "Usage: node scripts/create-superuser.js --email=... --password=... [--username=admin] [--name=Administrateur]"
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.error("Missing MONGODB_URI or MONGO_URL in environment");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email }).select("+password");

  if (existing) {
    existing.username = existing.username || username;
    existing.name = existing.name || name;
    existing.password = password;
    existing.role = "admin";
    existing.isActive = true;
    existing.emailVerified = true;
    existing.isMonitor = true;
    await existing.save();

    console.log("✓ Super user updated:");
    console.log(`  Email: ${existing.email}`);
    console.log(`  Role: ${existing.role}`);
    process.exit(0);
  }

  const user = new User({
    username,
    name,
    email,
    password,
    role: "admin",
    isMonitor: true,
    emailVerified: true,
    isActive: true,
  });

  await user.save();

  console.log("✓ Super user created:");
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  process.exit(0);
}

main()
  .catch((err) => {
    console.error("Failed to create super user:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore
    }
  });
