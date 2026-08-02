/* =====================================================================
   ⚠️ PARTIE PAIEMENT — CODE COMMENTÉ (tests du paiement)
   ---------------------------------------------------------------------
   La partie paiement a été mise en commentaire, ces tests ne peuvent
   donc plus s'exécuter (le contrôleur testé est commenté).
   Pour réactiver : retirez les marqueurs de commentaire ci-dessous.
   ===================================================================== */

/*
// Tests des paiements : webhook Stripe (signature + idempotence) et session de paiement
// Runner natif Node.js : node --test tests/
// Stripe, Enrollment et Course sont mockés via require.cache (aucune API ni BDD requise).

const { test } = require("node:test");
const assert = require("node:assert");

process.env.JWT_SECRET = "test-secret-key-eduhub";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

// ---- Mocks ----
const fakeStripe = {
  webhooks: {
    // Rejette si la signature est absente, sinon renvoie le body directement (déjà un objet event)
    constructEvent(payload, sig, secret) {
      if (!sig || !secret) {
        throw new Error("No signatures found matching the expected signature");
      }
      return typeof payload === "string" ? JSON.parse(payload) : payload;
    },
  },
  checkout: {
    sessions: {
      create: async () => ({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/c/pay/cs_test_123",
      }),
    },
  },
};

// "Base de données" d'inscriptions en mémoire pour tester l'idempotence
const enrollmentStore = new Map();
let courseIncrementCount = 0;

const fakeEnrollmentModel = {
  find: () => ({ populate: () => ({ sort: () => Promise.resolve([]) }) }),
  // Implémentation en mémoire basée sur le store (utilisée par le webhook)
  findOne: async (filter) => {
    if (!filter || !filter.student || !filter.course) return null;
    const key = `${filter.student}|${filter.course}`;
    return enrollmentStore.get(key) || null;
  },
  create: async (data) => {
    const key = `${data.student}|${data.course}`;
    const doc = {
      _id: `enr_${enrollmentStore.size + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data,
    };
    enrollmentStore.set(key, doc);
    return doc;
  },
  updateOne: async (filter, update) => {
    for (const doc of enrollmentStore.values()) {
      if (doc._id === filter._id) {
        Object.assign(doc, update);
      }
    }
    return { modifiedCount: 1 };
  },
};

const fakeCourseModel = {
  findById: async () => null,
  findByIdAndUpdate: async () => {
    courseIncrementCount += 1;
    return {};
  },
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
mockModule("../config/stripe", fakeStripe);
mockModule("../models/Enrollment", fakeEnrollmentModel);
mockModule("../models/Course", fakeCourseModel);

const {
  webhookCheckout,
  createCheckoutSession,
  getPaymentHistory,
} = require("../controllers/paymentController");

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
  res.send = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

// ---- WEBHOOK ----
test("webhook : 400 si la signature Stripe est manquante/invalide", async () => {
  const req = { headers: {}, body: Buffer.from(JSON.stringify({ type: "x" })) };
  const res = mockRes();
  await webhookCheckout(req, res);
  assert.strictEqual(res.statusCode, 400);
  assert.match(String(res.body), /Webhook Error/i);
});

test("webhook : événement non lié à un paiement simplement accusé", async () => {
  const req = {
    headers: { "stripe-signature": "sig_valid" },
    body: { type: "charge.succeeded", data: { object: {} } },
  };
  const res = mockRes();
  await webhookCheckout(req, res);
  assert.deepStrictEqual(res.body, { received: true });
});

test("webhook : checkout.session.completed crée l'inscription et incrémente UNE seule fois (idempotence)", async () => {
  enrollmentStore.clear();
  courseIncrementCount = 0;

  const session = {
    metadata: { studentId: "stu1", courseId: "crs1" },
    amount_total: 1000, // 10 EUR en centimes
    payment_intent: "pi_123",
  };
  const body = { type: "checkout.session.completed", data: { object: session } };
  const req = { headers: { "stripe-signature": "sig_valid" }, body };

  // 1er envoi du webhook
  const res1 = mockRes();
  await webhookCheckout(req, res1);
  assert.deepStrictEqual(res1.body, { received: true });
  assert.strictEqual(courseIncrementCount, 1, "incrément attendu au 1er envoi");
  assert.strictEqual(enrollmentStore.size, 1);
  // Conversion EUR : 1000 centimes => 10 EUR stockés
  const created = [...enrollmentStore.values()][0];
  assert.strictEqual(created.amountPaid, 10, "amountPaid doit être converti de centimes en EUR");

  // Webhook rejoué (même session) : AUCUN doublon ni double incrément
  const res2 = mockRes();
  await webhookCheckout(req, res2);
  assert.strictEqual(courseIncrementCount, 1, "studentsEnrolled ne doit PAS être incrémenté deux fois");
  assert.strictEqual(enrollmentStore.size, 1, "aucun doublon d'inscription");
});

// ---- CHECKOUT SESSION ----
test("createCheckoutSession : erreur 404 si le cours n'existe pas", async () => {
  fakeCourseModel.findById = async () => null;
  const req = { body: { courseId: "crs_inexistant" }, user: { _id: "u1", email: "a@b.c" } };
  let nextError = null;
  await createCheckoutSession(req, mockRes(), (err) => {
    nextError = err;
  });
  assert.ok(nextError, "next doit être appelé avec une erreur");
  assert.strictEqual(nextError.statusCode, 404);
});

test("createCheckoutSession : renvoie la session si le cours existe et n'est pas déjà suivi", async () => {
  fakeCourseModel.findById = async () => ({
    _id: "crs1",
    title: "Cours test",
    description: "Desc",
    thumbnail: "https://img.example/t.png",
    price: 10,
    discountPrice: null,
  });
  fakeEnrollmentModel.findOne = async () => null;

  const req = { body: { courseId: "crs1" }, user: { _id: "u1", email: "a@b.c" } };
  const res = mockRes();
  await createCheckoutSession(req, res, () => {});
  assert.strictEqual(res.body.status, "success");
  assert.strictEqual(res.body.sessionId, "cs_test_123");
  assert.ok(res.body.url.includes("checkout.stripe.com"));
});

test("getPaymentHistory : réponse vide formatée correctement", async () => {
  const req = { user: { _id: "u1" } };
  const res = mockRes();
  await getPaymentHistory(req, res, () => {});
  assert.strictEqual(res.body.status, "success");
  assert.strictEqual(res.body.results, 0);
  assert.deepStrictEqual(res.body.payments, []);
});
*/
