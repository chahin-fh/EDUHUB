/* =====================================================================
   ⚠️ PARTIE PAIEMENT — CODE COMMENTÉ (restriction « payer pour contacter
   les moniteurs »)
   ---------------------------------------------------------------------
   La restriction a été supprimée : tout utilisateur authentifié peut
   désormais contacter les moniteurs sans avoir payé.
   Pour réactiver : retirez les marqueurs de commentaire ci-dessous et
   réactivez les usages dans chatController.js et routes/matching.js.
   ===================================================================== */

/*
const Enrollment = require("../models/Enrollment");

// Vérifie si l'utilisateur a payé pour au moins un cours
// (inscription avec paiement complété et montant > 0)
const hasPaidEnrollment = async (userId) => {
  const paid = await Enrollment.findOne({
    student: userId,
    paymentStatus: "completed",
    amountPaid: { $gt: 0 },
  });
  return !!paid;
};

// @desc    Middleware : exige au moins un cours PAYÉ pour contacter des moniteurs
//          (demande de session, chat, ...).
// @access  Les administrateurs sont exemptés.
const requirePaidEnrollment = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next();
    }

    const paid = await hasPaidEnrollment(req.user._id);

    if (!paid) {
      return res.status(403).json({
        message:
          "Vous devez avoir payé pour un cours pour contacter les moniteurs",
      });
    }

    return next();
  } catch (error) {
    console.error("Paid enrollment middleware error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = requirePaidEnrollment;
module.exports.hasPaidEnrollment = hasPaidEnrollment;
*/
