const User = require("../models/userModel");
const MentorshipOffer = require("../models/mentorshipOfferModel");
const MentorshipPlan = require("../models/mentorshipPlanModel");
const MentorshipRecommendation = require("../models/mentorshipRecommendationModel");

// helpers
const isNgo = (user) => user?.roles?.includes("ngo");
const isBusinessOwner = (user) => user?.roles?.includes("business-owner");

/**
 * GET /api/mentorship/creators
 * NGO sees list of business owners (no filters)
 */
const getCreators = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can view creators." });
    }

    const creators = await User.find({ roles: "business-owner" })
      .select("name email roles profile createdAt")
      .sort({ createdAt: -1 });

    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * POST /api/mentorship/offers
 * NGO creates mentorship offer -> pending
 */
const createOffer = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can offer mentorship." });
    }

    const { businessOwnerId, message } = req.body;
    if (!businessOwnerId) {
      return res.status(400).json({ message: "businessOwnerId is required." });
    }

    const bo = await User.findById(businessOwnerId).select("_id roles name email");
    if (!bo) return res.status(404).json({ message: "Business owner not found." });
    if (!bo.roles?.includes("business-owner")) {
      return res.status(400).json({ message: "Selected user is not a business owner." });
    }

    // prevent duplicate pending offer for same pair
    const existingPending = await MentorshipOffer.findOne({
      ngoId: req.user._id,
      businessOwnerId,
      status: "pending",
      endedAt: null,
    });

    if (existingPending) {
      return res.status(409).json({ message: "You already have a pending offer for this business owner." });
    }

    const offer = await MentorshipOffer.create({
      ngoId: req.user._id,
      businessOwnerId,
      message: message || "",
      status: "pending",
      endedAt: null,
      endedBy: null,
    });

    const populated = await MentorshipOffer.findById(offer._id)
      .populate("ngoId", "name email roles profile")
      .populate("businessOwnerId", "name email roles profile");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/offers/my
 * Business owner sees their pending offers
 */
const getMyOffers = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can view mentorship offers." });
    }

    const offers = await MentorshipOffer.find({
      businessOwnerId: req.user._id,
      status: "pending",
      endedAt: null,
    })
      .sort({ createdAt: -1 })
      .populate("ngoId", "name email roles profile");

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PATCH /api/mentorship/offers/:id
 * Business owner accepts/rejects
 */
const updateOfferStatus = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can update mentorship offers." });
    }

    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use accepted or rejected." });
    }

    const offer = await MentorshipOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found." });

    if (String(offer.businessOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this offer." });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Only pending offers can be updated." });
    }

    if (offer.endedAt) {
      return res.status(400).json({ message: "This mentorship is already ended." });
    }

    offer.status = status;
    await offer.save();

    const populated = await MentorshipOffer.findById(offer._id)
      .populate("ngoId", "name email roles profile")
      .populate("businessOwnerId", "name email roles profile");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PATCH /api/mentorship/offers/:id/end
 * Either NGO or business owner can end an accepted mentorship
 */
const endMentorship = async (req, res) => {
  try {
    const offer = await MentorshipOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Mentorship offer not found." });

    if (offer.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted mentorships can be ended." });
    }

    if (offer.endedAt) {
      return res.status(400).json({ message: "Mentorship already ended." });
    }

    const userId = String(req.user._id);
    const isNgoUser = userId === String(offer.ngoId);
    const isBoUser = userId === String(offer.businessOwnerId);

    if (!isNgoUser && !isBoUser) {
      return res.status(403).json({ message: "Not authorized to end this mentorship." });
    }

    offer.endedAt = new Date();
    offer.endedBy = isNgoUser ? "ngo" : "business-owner";
    await offer.save();

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/mentors
 * Business owner: list accepted mentors (active only)
 */
const getMyMentors = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can view mentors." });
    }

    const accepted = await MentorshipOffer.find({
      businessOwnerId: req.user._id,
      status: "accepted",
      endedAt: null,
    })
      .sort({ createdAt: -1 })
      .populate("ngoId", "name email roles profile");

    const mentors = accepted.map((o) => ({
      offerId: o._id,
      ngo: o.ngoId,
      acceptedAt: o.updatedAt,
    }));

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/mentees
 * NGO: list accepted mentees (active only)
 */
const getMyMentees = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can view mentees." });
    }

    const accepted = await MentorshipOffer.find({
      ngoId: req.user._id,
      status: "accepted",
      endedAt: null,
    })
      .sort({ createdAt: -1 })
      .populate("businessOwnerId", "name email roles profile");

    const mentees = accepted.map((o) => ({
      offerId: o._id,
      mentee: o.businessOwnerId,
      acceptedAt: o.updatedAt,
    }));

    res.json(mentees);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * POST /api/mentorship/plans
 * NGO creates action plan (accepted & active mentorship required)
 */
const createPlan = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can create action plans." });
    }

    const { businessOwnerId, title, steps, deadline } = req.body;
    if (!businessOwnerId || !title) {
      return res.status(400).json({ message: "businessOwnerId and title are required." });
    }

    const relation = await MentorshipOffer.findOne({
      ngoId: req.user._id,
      businessOwnerId,
      status: "accepted",
      endedAt: null,
    });

    if (!relation) {
      return res.status(403).json({ message: "Mentorship must be accepted (and active) before creating plans." });
    }

    const plan = await MentorshipPlan.create({
      ngoId: req.user._id,
      businessOwnerId,
      title,
      steps: Array.isArray(steps) ? steps : [],
      deadline: deadline ? new Date(deadline) : null,
      status: "incomplete",
      completedAt: null,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/plans/my
 * Business owner views plans created for them
 * Optional query ?ngoId=xxx
 */
const getMyPlans = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can view action plans." });
    }

    const filter = { businessOwnerId: req.user._id };
    if (req.query.ngoId) filter.ngoId = req.query.ngoId;

    const plans = await MentorshipPlan.find(filter)
      .sort({ createdAt: -1 })
      .populate("ngoId", "name email roles profile");

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/plans/for-mentee/:menteeId
 * NGO views plans they created for a mentee
 */
const getPlansForMentee = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can view mentee plans." });
    }

    const menteeId = req.params.menteeId;

    const plans = await MentorshipPlan.find({
      ngoId: req.user._id,
      businessOwnerId: menteeId,
    }).sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PATCH /api/mentorship/plans/:id/complete
 * Business owner marks plan complete
 */
const completePlan = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can complete plans." });
    }

    const plan = await MentorshipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found." });

    if (String(plan.businessOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this plan." });
    }

    if (plan.status === "complete") {
      return res.status(400).json({ message: "Plan is already complete." });
    }

    plan.status = "complete";
    plan.completedAt = new Date();
    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * POST /api/mentorship/recommendations
 * NGO recommends training (accepted & active mentorship required)
 */
const createRecommendation = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can recommend trainings." });
    }

    const { businessOwnerId, trainingId, note } = req.body;
    if (!businessOwnerId || !trainingId) {
      return res.status(400).json({ message: "businessOwnerId and trainingId are required." });
    }

    const relation = await MentorshipOffer.findOne({
      ngoId: req.user._id,
      businessOwnerId,
      status: "accepted",
      endedAt: null,
    });

    if (!relation) {
      return res.status(403).json({ message: "Mentorship must be accepted (and active) before recommending." });
    }

    const rec = await MentorshipRecommendation.create({
      ngoId: req.user._id,
      businessOwnerId,
      trainingId,
      note: note || "",
      status: "incomplete",
      completedAt: null,
    });

    const populated = await MentorshipRecommendation.findById(rec._id)
      .populate("trainingId", "title videoUrl tags level language thumbnailUrl")
      .populate("ngoId", "name email roles profile");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/recommendations/my
 * Business owner views recommendations
 * Optional query ?ngoId=xxx
 */
const getMyRecommendations = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can view recommendations." });
    }

    const filter = { businessOwnerId: req.user._id };
    if (req.query.ngoId) filter.ngoId = req.query.ngoId;

    const recs = await MentorshipRecommendation.find(filter)
      .sort({ createdAt: -1 })
      .populate("trainingId", "title videoUrl tags level language thumbnailUrl")
      .populate("ngoId", "name email roles profile");

    res.json(recs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/mentorship/recommendations/for-mentee/:menteeId
 * NGO views recs they created for mentee
 */
const getRecommendationsForMentee = async (req, res) => {
  try {
    if (!isNgo(req.user)) {
      return res.status(403).json({ message: "Only NGOs can view mentee recommendations." });
    }

    const menteeId = req.params.menteeId;

    const recs = await MentorshipRecommendation.find({
      ngoId: req.user._id,
      businessOwnerId: menteeId,
    })
      .sort({ createdAt: -1 })
      .populate("trainingId", "title videoUrl tags level language thumbnailUrl");

    res.json(recs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * PATCH /api/mentorship/recommendations/:id/complete
 * Business owner completes recommendation
 */
const completeRecommendation = async (req, res) => {
  try {
    if (!isBusinessOwner(req.user)) {
      return res.status(403).json({ message: "Only business owners can complete recommendations." });
    }

    const rec = await MentorshipRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ message: "Recommendation not found." });

    if (String(rec.businessOwnerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this recommendation." });
    }

    if (rec.status === "complete") {
      return res.status(400).json({ message: "Recommendation is already complete." });
    }

    rec.status = "complete";
    rec.completedAt = new Date();
    await rec.save();

    const populated = await MentorshipRecommendation.findById(rec._id)
      .populate("trainingId", "title videoUrl tags level language thumbnailUrl")
      .populate("ngoId", "name email roles profile");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getCreators,
  createOffer,
  getMyOffers,
  updateOfferStatus,
  endMentorship,
  getMyMentors,
  getMyMentees,
  createPlan,
  getMyPlans,
  getPlansForMentee,
  completePlan,
  createRecommendation,
  getMyRecommendations,
  getRecommendationsForMentee,
  completeRecommendation,
};
