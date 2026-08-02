/* =====================================================================
   ⚠️ PARTIE PAIEMENT — CODE COMMENTÉ (Stripe)
   ---------------------------------------------------------------------
   La partie paiement a été mise en commentaire sur demande.
   Pour réactiver : retirez les marqueurs de commentaire ci-dessous.
   ===================================================================== */

/*
const stripe = require("../config/stripe");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { AppError } = require("../middleware/errorHandler");

// Devise de facturation (Stripe) : EUR par défaut, configurable via .env
// (STRIPE_CURRENCY=eur|usd|tnd). Note : TND a 3 décimales (millimes),
// EUR/USD en ont 2 (centimes) — d'où le tableau des unités.
const CURRENCY_UNITS = { tnd: 1000, usd: 100, eur: 100 };
const checkoutCurrency = (process.env.STRIPE_CURRENCY || "eur").toLowerCase();
const currencyUnit = CURRENCY_UNITS[checkoutCurrency] || 100;

// @desc    Récupérer l'historique des paiements de l'utilisateur
// @route   GET /api/payment/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      paymentStatus: { $in: ["completed", "pending", "refunded"] },
    })
      .populate({
        path: "course",
        select: "title courseName thumbnail price discountPrice category",
      })
      .sort({ paymentDate: -1, enrolledAt: -1 });

    res.json({
      status: "success",
      results: enrollments.length,
      payments: enrollments.map((enrollment) => ({
        _id: enrollment._id,
        course: enrollment.course,
        amountPaid: enrollment.amountPaid,
        paymentStatus: enrollment.paymentStatus,
        paymentMethod: enrollment.paymentMethod,
        transactionId: enrollment.transactionId,
        paymentDate: enrollment.paymentDate || enrollment.enrolledAt,
        status: enrollment.status,
        completionPercentage: enrollment.completionPercentage,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Créer une session de paiement
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError("Cours non trouvé", 404));
    }

    // Vérifier si déjà inscrit
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return next(new AppError("Déjà inscrit", 400));
    }

    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: checkoutCurrency,
            product_data: {
              name: course.title,
              description: course.description,
              images: [course.thumbnail],
            },
            unit_amount: Math.round(
              (course.discountPrice || course.price) * currencyUnit
            ), // Montant en plus petite unité (centimes pour EUR/USD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/cours/${courseId}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/cours/${courseId}?cancelled=true`,
      customer_email: req.user.email,
      client_reference_id: courseId,
      metadata: {
        courseId: courseId.toString(),
        studentId: req.user._id.toString(),
      },
    });

    res.json({
      status: "success",
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

// Webhook Stripe
exports.webhookCheckout = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { studentId, courseId } = session.metadata;

    // Idempotence réelle : on vérifie d'abord l'existence de l'inscription.
    // Si elle existe déjà (webhook rejoué par Stripe, même rapidement), on ne fait
    // qu'une mise à jour des informations de paiement, SANS ré-incrémenter
    // studentsEnrolled. L'incrément ne se produit que lors de la création.
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    const paymentFields = {
      paymentStatus: "completed",
      // Convertir la plus petite unité (centimes pour EUR/USD, millimes pour TND)
      amountPaid: session.amount_total / currencyUnit,
      paymentMethod: "card",
      transactionId: session.payment_intent,
      paymentDate: new Date(),
      status: "active",
    };

    if (existingEnrollment) {
      await Enrollment.updateOne({ _id: existingEnrollment._id }, paymentFields);
    } else {
      await Enrollment.create({
        student: studentId,
        course: courseId,
        ...paymentFields,
      });
      await Course.findByIdAndUpdate(courseId, {
        $inc: { studentsEnrolled: 1 },
      });
    }
  }

  res.json({ received: true });
};
*/
