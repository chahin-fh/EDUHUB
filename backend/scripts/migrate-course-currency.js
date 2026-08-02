// Migration ponctuelle : passage de la devise des cours existants en EUR.
// L'application facture désormais en EUR (STRIPE_CURRENCY=eur) ; les cours
// créés avant ce changement ont `currency: "TND"` (ou champ absent).
// → Ce script met simplement à jour `currency` à "EUR" SANS modifier les prix
//   (décision : même nombre, juste le libellé).
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
  override: true,
});
const mongoose = require("mongoose");

(async () => {
  try {
    const candidates = [
      process.env.MONGODB_URI,
      process.env.MONGO_URL,
      "mongodb://localhost:27017/EDUHUB",
    ].filter(Boolean);
    await mongoose.connect(candidates[0]);
    const db = mongoose.connection.db;
    const coll = db.collection("courses");

    const total = await coll.countDocuments();
    console.log("Total de cours en base :", total);

    const toMigrate = await coll
      .find({ currency: { $ne: "EUR" } })
      .project({ title: 1, courseName: 1, price: 1, discountPrice: 1, currency: 1 })
      .toArray();

    console.log("Cours à migrer (currency != EUR) :", toMigrate.length);
    toMigrate.slice(0, 10).forEach((c) =>
      console.log(
        `  - ${c.title || c.courseName || c._id} | prix: ${c.price ?? 0} | currency: ${c.currency || "(vide)"}`
      )
    );
    if (toMigrate.length > 10) {
      console.log(`  ... et ${toMigrate.length - 10} autres`);
    }

    if (toMigrate.length === 0) {
      console.log("✓ Rien à faire : tous les cours sont déjà en EUR.");
    } else {
      const result = await coll.updateMany(
        { currency: { $ne: "EUR" } },
        { $set: { currency: "EUR" } }
      );
      console.log("✓ Cours mis à jour :", result.modifiedCount);

      // Vérification finale
      const remaining = await coll.countDocuments({ currency: { $ne: "EUR" } });
      console.log("Cours restants hors EUR :", remaining);
    }
  } catch (err) {
    console.error("✗ MIGRATION ERROR:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
