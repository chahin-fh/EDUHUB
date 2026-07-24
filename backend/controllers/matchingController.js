const MatchRequest = require("../models/MatchRequest");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Subject = require("../models/Subject");

// @desc    Find students who teach a given subject
// @route   GET /api/matching/find
// @access  Private
exports.findMentorsBySubject = async (req, res) => {
  try {
    const { subject, search, minRating } = req.query;

    if (!subject) {
      return res.status(400).json({ message: "Le paramètre subject est requis" });
    }

    const query = {
      _id: { $ne: req.user._id },
      isMonitor: true,
      isActive: true,
      "monitorProfile.expertise.subject": subject,
    };

    if (minRating) {
      query["monitorProfile.rating"] = { $gte: parseInt(minRating) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    const mentors = await User.find(query)
      .select("name username email avatar bio monitorProfile")
      .populate({
        path: "monitorProfile.expertise.subject",
        select: "name slug category",
      })
      .sort({ "monitorProfile.rating": -1, "monitorProfile.ratingsCount": -1 });

    // Get the subject info for the response
    const subjectInfo = await Subject.findById(subject).select("name category");

    res.json({
      success: true,
      subject: subjectInfo,
      mentors,
      count: mentors.length,
    });
  } catch (error) {
    console.error("Error finding mentors:", error);
    res.status(500).json({ message: "Erreur lors de la recherche", error: error.message });
  }
};

// @desc    Get all subjects with their mentor counts
// @route   GET /api/matching/subjects
// @access  Public
exports.getMatchingSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().lean();

    // Get mentor counts per subject
    const subjectsWithCounts = await Promise.all(
      subjects.map(async (subject) => {
        const count = await User.countDocuments({
          isMonitor: true,
          isActive: true,
          "monitorProfile.expertise.subject": subject._id,
        });
        return { ...subject, mentorCount: count };
      })
    );

    res.json({
      success: true,
      subjects: subjectsWithCounts.filter((s) => s.mentorCount > 0),
    });
  } catch (error) {
    console.error("Error getting matching subjects:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// @desc    Create a match request
// @route   POST /api/matching/request
// @access  Private
exports.createMatchRequest = async (req, res) => {
  try {
    const { mentorId, subjectId, message } = req.body;

    if (!mentorId || !subjectId) {
      return res.status(400).json({ message: "mentorId et subjectId sont requis" });
    }

    // Cannot request yourself
    if (mentorId === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous envoyer une demande" });
    }

    // Check if mentor exists and teaches this subject
    const mentor = await User.findOne({
      _id: mentorId,
      isMonitor: true,
      isActive: true,
    });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor non trouvé" });
    }

    const teachesSubject = mentor.monitorProfile.expertise.some(
      (e) => e.subject.toString() === subjectId
    );

    if (!teachesSubject) {
      return res.status(400).json({ message: "Ce mentor n'enseigne pas cette matière" });
    }

    // Check for existing pending request
    const existingRequest = await MatchRequest.findOne({
      requester: req.user._id,
      mentor: mentorId,
      subject: subjectId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Une demande en attente existe déjà pour cette matière",
        request: existingRequest,
      });
    }

    const matchRequest = await MatchRequest.create({
      requester: req.user._id,
      mentor: mentorId,
      subject: subjectId,
      message: message || "",
    });

    const populatedRequest = await MatchRequest.findById(matchRequest._id)
      .populate("requester", "name username email avatar")
      .populate("mentor", "name username email avatar")
      .populate("subject", "name slug");

    res.status(201).json({
      success: true,
      message: "Demande envoyée avec succès",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Error creating match request:", error);
    res.status(500).json({ message: "Erreur lors de la création de la demande", error: error.message });
  }
};

// @desc    Accept or decline a match request
// @route   PATCH /api/matching/request/:id
// @access  Private
exports.respondToMatchRequest = async (req, res) => {
  try {
    const { status } = req.body; // "accepted" or "declined"

    if (!status || !["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Status invalide (accepted ou declined)" });
    }

    const matchRequest = await MatchRequest.findById(req.params.id);

    if (!matchRequest) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Only the mentor can accept/decline
    if (matchRequest.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à répondre à cette demande" });
    }

    if (matchRequest.status !== "pending") {
      return res.status(400).json({ message: "Cette demande a déjà été traitée" });
    }

    // If accepted, create a conversation automatically
    let conversation = null;
    if (status === "accepted") {
      conversation = await Conversation.findOne({
        type: "direct",
        participants: { $all: [matchRequest.requester, matchRequest.mentor] },
        $expr: { $eq: [{ $size: "$participants" }, 2] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: "direct",
          participants: [matchRequest.requester, matchRequest.mentor],
          lastMessageAt: new Date(),
        });
      }

      matchRequest.conversation = conversation._id;
    }

    matchRequest.status = status;
    await matchRequest.save();

    const populatedRequest = await MatchRequest.findById(matchRequest._id)
      .populate("requester", "name username email avatar")
      .populate("mentor", "name username email avatar")
      .populate("subject", "name slug")
      .populate("conversation");

    res.json({
      success: true,
      message: status === "accepted" ? "Demande acceptée" : "Demande refusée",
      request: populatedRequest,
      conversation: conversation
        ? await Conversation.findById(conversation._id)
            .populate("participants", "name username email avatar")
        : null,
    });
  } catch (error) {
    console.error("Error responding to match request:", error);
    res.status(500).json({ message: "Erreur lors de la réponse", error: error.message });
  }
};

// @desc    Get user's match requests (sent and received)
// @route   GET /api/matching/requests
// @access  Private
exports.getMyMatchRequests = async (req, res) => {
  try {
    const { type } = req.query; // "sent", "received", or all

    let query = {};
    if (type === "sent") {
      query.requester = req.user._id;
    } else if (type === "received") {
      query.mentor = req.user._id;
    } else {
      query.$or = [
        { requester: req.user._id },
        { mentor: req.user._id },
      ];
    }

    const requests = await MatchRequest.find(query)
      .populate("requester", "name username email avatar")
      .populate("mentor", "name username email avatar")
      .populate("subject", "name slug category")
      .populate("conversation")
      .sort({ createdAt: -1 });

    // Separate into sent and received
    const sent = requests.filter(
      (r) => r.requester._id.toString() === req.user._id.toString()
    );
    const received = requests.filter(
      (r) => r.mentor._id.toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      requests,
      sent,
      received,
    });
  } catch (error) {
    console.error("Error getting match requests:", error);
    res.status(500).json({ message: "Erreur lors du chargement des demandes", error: error.message });
  }
};
