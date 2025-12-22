const Establishment = require("../models/Establishment");
const { uploadImage } = require("../config/cloudinary");

// @desc    Get all establishments
// @route   GET /api/establishments
// @access  Public
exports.getEstablishments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by city
    if (req.query.city) {
      query["address.city"] = new RegExp(req.query.city, "i");
    }

    const establishments = await Establishment.find(query)
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reviews.user", "username avatar");

    const total = await Establishment.countDocuments(query);

    res.status(200).json({
      establishments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get establishments error:", error);
    res.status(500).json({
      message: "Server error while fetching establishments",
      error: error.message,
    });
  }
};

// @desc    Get single establishment
// @route   GET /api/establishments/:id
// @access  Public
exports.getEstablishment = async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id).populate(
      "reviews.user",
      "username avatar"
    );

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    if (!establishment.isActive) {
      return res.status(404).json({ message: "Establishment not available" });
    }

    res.status(200).json(establishment);
  } catch (error) {
    console.error("Get establishment error:", error);
    res.status(500).json({
      message: "Server error while fetching establishment",
      error: error.message,
    });
  }
};

// @desc    Create new establishment
// @route   POST /api/establishments
// @access  Private/Admin
exports.createEstablishment = async (req, res) => {
  try {
    const establishmentData = req.body;

    // Debug log pour voir les données reçues
    console.log("Données reçues:", JSON.stringify(establishmentData, null, 2));

    // Validation du champ type
    if (!establishmentData.type || establishmentData.type.trim() === "") {
      return res.status(400).json({
        message: "Type field is required",
        receivedData: establishmentData,
      });
    }

    // Check if establishment with same name already exists
    const existingEstablishment = await Establishment.findOne({
      name: establishmentData.name,
      "address.city": establishmentData.address.city,
    });

    if (existingEstablishment) {
      return res.status(400).json({
        message: "Establishment with this name already exists in this city",
      });
    }

    const establishment = await Establishment.create(establishmentData);

    res.status(201).json({
      message: "Establishment created successfully",
      establishment,
    });
  } catch (error) {
    console.error("Create establishment error:", error);
    res.status(500).json({
      message: "Server error while creating establishment",
      error: error.message,
    });
  }
};

// @desc    Update establishment
// @route   PUT /api/establishments/:id
// @access  Private/Admin
exports.updateEstablishment = async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Establishment updated successfully",
      establishment: updatedEstablishment,
    });
  } catch (error) {
    console.error("Update establishment error:", error);
    res.status(500).json({
      message: "Server error while updating establishment",
      error: error.message,
    });
  }
};

// @desc    Delete establishment
// @route   DELETE /api/establishments/:id
// @access  Private/Admin
exports.deleteEstablishment = async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    // Soft delete - set isActive to false
    await Establishment.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      message: "Establishment deleted successfully",
    });
  } catch (error) {
    console.error("Delete establishment error:", error);
    res.status(500).json({
      message: "Server error while deleting establishment",
      error: error.message,
    });
  }
};

// @desc    Add review to establishment
// @route   POST /api/establishments/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    // Check if user already reviewed
    const existingReview = establishment.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this establishment",
      });
    }

    // Add new review
    establishment.reviews.push({
      user: userId,
      rating,
      comment,
    });

    // Update overall rating
    const totalRating = establishment.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    establishment.rating = totalRating / establishment.reviews.length;

    await establishment.save();

    res.status(201).json({
      message: "Review added successfully",
      establishment,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      message: "Server error while adding review",
      error: error.message,
    });
  }
};

// @desc    Upload establishment images
// @route   POST /api/establishments/:id/images
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ message: "Establishment not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const imageUrls = req.files.map((file) => file.path);

    // Add images to establishment
    establishment.images.push(...imageUrls);
    await establishment.save();

    res.status(200).json({
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    console.error("Upload images error:", error);
    res.status(500).json({
      message: "Server error while uploading images",
      error: error.message,
    });
  }
};

// @desc    Get establishment statistics
// @route   GET /api/establishments/stats
// @access  Private/Admin
exports.getEstablishmentStats = async (req, res) => {
  try {
    const total = await Establishment.countDocuments({ isActive: true });
    const byType = await Establishment.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    const featured = await Establishment.countDocuments({
      featured: true,
      isActive: true,
    });
    const verified = await Establishment.countDocuments({
      isVerified: true,
      isActive: true,
    });
    const averageRating = await Establishment.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    res.status(200).json({
      total,
      byType,
      featured,
      verified,
      averageRating: averageRating[0]?.avgRating || 0,
    });
  } catch (error) {
    console.error("Get establishment stats error:", error);
    res.status(500).json({
      message: "Server error while fetching establishment statistics",
      error: error.message,
    });
  }
};
