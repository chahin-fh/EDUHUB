// Tests de l'authentification (chemin de garde + logique de base)
// Runner natif Node.js : node --test tests/
// Aucune base de données requise : le modèle User est mocké via require.cache.

const { test } = require("node:test");
const assert = require("node:assert");

process.env.JWT_SECRET = "test-secret-key-eduhub";

// ---- Mock du modèle User avant de charger le contrôleur ----
const fakeUserModel = {
  findOne: async () => null,
  create: async (data) => ({
    _id: "user123",
    name: data.name,
    username: data.username || data.name,
    email: data.email,
    emailVerified: false,
    save: async () => {},
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

const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
} = require("../controllers/authController");

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

// ---- LOGIN ----
test("login : 400 si email manquant", async () => {
  const req = { body: { password: "secret123" } };
  const res = mockRes();
  await loginUser(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /required/i);
});

test("login : 400 si mot de passe manquant", async () => {
  const req = { body: { email: "test@example.com" } };
  const res = mockRes();
  await loginUser(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /required/i);
});

// ---- REGISTER ----
test("register : 400 si champs manquants", async () => {
  const req = { body: { email: "a@b.c" } };
  const res = mockRes();
  await registerUser(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /required/i);
});

test("register : 400 si email invalide", async () => {
  const req = { body: { name: "Jean", email: "pas-un-email", password: "secret123" } };
  const res = mockRes();
  await registerUser(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /Invalid email format/i);
});

test("register : 400 si mot de passe trop court", async () => {
  const req = { body: { name: "Jean", email: "jean@example.com", password: "123" } };
  const res = mockRes();
  await registerUser(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /at least 6 characters/i);
});

test("register : 400 si l'utilisateur existe déjà", async () => {
  fakeUserModel.findOne = async () => ({ email: "dup@example.com" });
  try {
    const req = { body: { name: "Dup", email: "dup@example.com", password: "secret123" } };
    const res = mockRes();
    await registerUser(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /already exists/i);
  } finally {
    fakeUserModel.findOne = async () => null; // reset même si le test échoue
  }
});

test("register : 201 + token si succès", async () => {
  const req = { body: { name: "Jane", email: "jane@example.com", password: "secret123" } };
  const res = mockRes();
  await registerUser(req, res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.email, "jane@example.com");
  assert.ok(res.body.token, "un token JWT doit être renvoyé");
});

// ---- EMAIL ----
test("verifyEmail : 400 si token manquant", async () => {
  const req = { params: {} };
  const res = mockRes();
  await verifyEmail(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /token is required/i);
});

test("resendVerification : 400 si email manquant", async () => {
  const req = { body: {} };
  const res = mockRes();
  await resendVerificationEmail(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(res.body.message, /Email is required/i);
});
