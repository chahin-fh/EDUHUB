// Tests des middlewares d'authentification et de rôle
// Runner natif Node.js : node --test tests/
// Vérifie notamment qu'un étudiant ne peut PAS accéder aux routes admin/monitor.

const { test } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-key-eduhub";

const fakeUser = { _id: "user123", role: "user", isMonitor: false, emailVerified: true };

// Mock du modèle User pour le chemin "token valide" de protect
const fakeUserModel = {
  findById: () => ({
    select: async () => ({ ...fakeUser }),
  }),
};

function mockModule(modulePath, fake) {
  const resolved = require.resolve(modulePath);
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports: fake,
  };
}
mockModule("../models/User", fakeUserModel);

const protect = require("../middleware/authMiddleware");
const { adminOnly, monitorOnly, adminOrMonitorOnly } = protect;

function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

function userWith(role, isMonitor) {
  return { _id: "u1", role, isMonitor: !!isMonitor };
}

// ---- PROTECT ----
test("protect : 401 sans token", async () => {
  const req = { headers: {} };
  const res = mockRes();
  await protect(req, res, () => {});
  assert.strictEqual(res.statusCode, 401);
  assert.match(res.body.message, /no token/i);
});

test("protect : 401 avec token invalide", async () => {
  const req = { headers: { authorization: "Bearer pas-un-jwt" } };
  const res = mockRes();
  await protect(req, res, () => {});
  assert.strictEqual(res.statusCode, 401);
  assert.match(res.body.message, /token failed/i);
});

test("protect : 401 avec token expiré", async () => {
  const expired = jwt.sign({ id: "user123" }, process.env.JWT_SECRET, { expiresIn: "-10s" });
  const req = { headers: { authorization: `Bearer ${expired}` } };
  const res = mockRes();
  await protect(req, res, () => {});
  assert.strictEqual(res.statusCode, 401);
});

test("protect : next() appelé et req.user défini avec token valide", async () => {
  const token = jwt.sign({ id: "user123" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;
  await protect(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
  assert.ok(req.user, "req.user doit être peuplé");
  assert.strictEqual(req.user._id, "user123");
});

// ---- ADMIN ONLY ----
test("adminOnly : étudiant interdit (403)", () => {
  const req = { user: userWith("user", false) };
  const res = mockRes();
  let nextCalled = false;
  adminOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test("adminOnly : admin autorisé (next)", () => {
  const req = { user: userWith("admin", false) };
  const res = mockRes();
  let nextCalled = false;
  adminOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
});

// ---- MONITOR ONLY ----
test("monitorOnly : étudiant interdit (403)", () => {
  const req = { user: userWith("user", false) };
  const res = mockRes();
  let nextCalled = false;
  monitorOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test("monitorOnly : moniteur autorisé (next)", () => {
  const req = { user: userWith("user", true) };
  const res = mockRes();
  let nextCalled = false;
  monitorOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
});

test("monitorOnly : admin autorisé (next)", () => {
  const req = { user: userWith("admin", false) };
  const res = mockRes();
  let nextCalled = false;
  monitorOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
});

// ---- ADMIN OR MONITOR ----
test("adminOrMonitorOnly : étudiant interdit (403)", () => {
  const req = { user: userWith("user", false) };
  const res = mockRes();
  let nextCalled = false;
  adminOrMonitorOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);
});

test("adminOrMonitorOnly : moniteur autorisé (next)", () => {
  const req = { user: userWith("user", true) };
  const res = mockRes();
  let nextCalled = false;
  adminOrMonitorOnly(req, res, () => {
    nextCalled = true;
  });
  assert.strictEqual(nextCalled, true);
});
