const Review = require("../models/Review");
const MatchRequest = require("../models/MatchRequest");
const User = require("../models/User");

// @desc    Create a review after an accepted match
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { toUserId, subjectId, rating, comment, matchRequestId } = req.body;

    if (!toUserId || !subjectId || !rating) {
      return res.status(400).json({
        message: "toUserId, subjectId et rating sont requis",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "La note doit être entre 1 et 5" });
    }

    // Cannot review yourself
    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous noter vous-même" });
    }

    // Check if there was an accepted match request between these users
    let matchQuery = {
      $or: [
        { requester: req.user._id, mentor: toUserId },
        { requester: toUserId, mentor: req.user._id },
      ],
      subject: subjectId,
      status: "accepted",
    };

    if (matchRequestId) {
      matchQuery._id = matchRequestId;
    }

    const matchRequest = await MatchRequest.findOne(matchQuery);

    if (!matchRequest) {
      return res.status(400).json({
        message: "Aucune session complétée trouvée pour noter cet utilisateur sur cette matière",
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      from: req.user._id,
      to: toUserId,
      subject: subjectId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Vous avez déjà noté cet utilisateur pour cette matière",
        review: existingReview,
      });
    }

    const review = await Review.create({
      from: req.user._id,
      to: toUserId,
      subject: subjectId,
      matchRequest: matchRequest._id,
      rating,
      comment: comment || "",
    });

    // Update the target user's average rating
    const allReviews = await Review.find({ to: toUserId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(toUserId, {
      "monitorProfile.rating": Math.round(avgRating * 10) / 10,
      "monitorProfile.ratingsCount": allReviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("from", "name username avatar")
      .populate("to", "name username avatar")
      .populate("subject", "name slug");

    res.status(201).json({
      success: true,
      message: "Avis envoyé avec succès",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Erreur lors de la création de l'avis", error: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ to: req.params.userId })
      .populate("from", "name username avatar")
      .populate("subject", "name slug")
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      ratingDistribution[r.rating - 1]++;
    });

    res.json({
      success: true,
      reviews,
      stats: {
        total: totalReviews,
        average: Math.round(avgRating * 10) / 10,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({ message: "Erreur lors du chargement des avis", error: error.message });
  }
};

// @desc    Get reviews I've given
// @route   GET /api/reviews/mine
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ from: req.user._id })
      .populate("to", "name username avatar")
      .populate("subject", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error getting my reviews:", error);
    res.status(500).json({ message: "Erreur lors du chargement de vos avis", error: error.message });
  }
};

// @desc    Delete a review (only by author)
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    if (review.from.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres avis" });
    }

    const targetUserId = review.to;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    const allReviews = await Review.find({ to: targetUserId });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await User.findByIdAndUpdate(targetUserId, {
      "monitorProfile.rating": Math.round(avgRating * 10) / 10,
      "monitorProfile.ratingsCount": allReviews.length,
    });

    res.json({
      success: true,
      message: "Avis supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};
