const stripe = require("../config/stripe");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { AppError } = require("../middleware/errorHandler");

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
      success_url: `${process.env.FRONTEND_URL}/courses/${courseId}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}?cancelled=true`,
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

    // Créer l'inscription
    await Enrollment.create({
      student: session.metadata.studentId,
      course: session.metadata.courseId,
      paymentStatus: "completed",
      amountPaid: session.amount_total / 1000, // Convertir de millimes
      paymentMethod: "card",
      transactionId: session.payment_intent,
      paymentDate: new Date(),
    });

    // Incrémenter compteur étudiants
    await Course.findByIdAndUpdate(session.metadata.courseId, {
      $inc: { studentsEnrolled: 1 },
    });
  }

  res.json({ received: true });
};
