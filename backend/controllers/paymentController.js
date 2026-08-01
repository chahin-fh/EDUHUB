const stripe = require("../config/stripe");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { AppError } = require("../middleware/errorHandler");

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
            currency: "tnd",
            product_data: {
              name: course.title,
              description: course.description,
              images: [course.thumbnail],
            },
            unit_amount: Math.round(
              (course.discountPrice || course.price) * 1000
            ), // Stripe utilise millimes
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

    // Créer ou mettre à jour l'inscription (évite doublons si webhook rejoué)
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        student: session.metadata.studentId,
        course: session.metadata.courseId,
      },
      {
        $set: {
          paymentStatus: "completed",
          amountPaid: session.amount_total / 1000, // Convertir de millimes
          paymentMethod: "card",
          transactionId: session.payment_intent,
          paymentDate: new Date(),
          status: "active",
        },
        $setOnInsert: {
          student: session.metadata.studentId,
          course: session.metadata.courseId,
        },
      },
      { upsert: true, new: true }
    );

    // N'incrémenter le compteur que si l'inscription est nouvelle (pas un doublon)
    // Si createdAt === updatedAt à ~1s près, c'est une création
    const isNewEnrollment =
      Math.abs(enrollment.createdAt - enrollment.updatedAt) < 2000;

    if (isNewEnrollment) {
      await Course.findByIdAndUpdate(session.metadata.courseId, {
        $inc: { studentsEnrolled: 1 },
      });
    }
  }

  res.json({ received: true });
};
