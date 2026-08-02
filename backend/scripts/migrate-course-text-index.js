// Migration ponctuelle : recrée l'index texte de la collection `courses` avec
// language_override: "docLang" (champ inexistant) afin que MongoDB ne valide
// plus le champ `language` contre ses codes de langue.
// → permet de stocker n'importe quelle langue (« Français », « Arabe », ...).
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

    const indexes = await coll.indexes();
    console.log("Index actuels sur courses :");
    indexes.forEach((i) =>
      console.log(
        "  -",
        i.name,
        JSON.stringify(i.key),
        "langOverride:",
        i.language_override || "(défaut)"
      )
    );

    const textIndex = indexes.find((i) =>
      Object.values(i.key).some((v) => v === "text")
    );

    if (textIndex) {
      await coll.dropIndex(textIndex.name);
      console.log("✓ Ancien index texte supprimé :", textIndex.name);
    } else {
      console.log("Aucun index texte trouvé.");
    }

    // Même nom que celui généré par mongoose pour éviter tout conflit au redémarrage
    await coll.createIndex(
      { title: "text", description: "text", tags: "text" },
      { name: "title_text_description_text_tags_text", language_override: "docLang" }
    );
    console.log("✓ Nouvel index texte créé avec language_override='docLang'");

    const after = await coll.indexes();
    after.forEach((i) =>
      console.log(
        "  -",
        i.name,
        JSON.stringify(i.key),
        "langOverride:",
        i.language_override || "(défaut)"
      )
    );
  } catch (err) {
    console.error("✗ MIGRATION ERROR:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
