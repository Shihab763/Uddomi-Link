const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getCreators,
  createOffer,
  getMyOffers,
  updateOfferStatus,
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
} = require("../controllers/mentorshipController");

// Creators list (NGO only)
router.get("/creators", protect, getCreators);

// Mentorship offers
router.post("/offers", protect, createOffer);
router.get("/offers/my", protect, getMyOffers);
router.patch("/offers/:id", protect, updateOfferStatus);

// Mentors / Mentees
router.get("/mentors", protect, getMyMentors);
router.get("/mentees", protect, getMyMentees);

// Action plans
router.post("/plans", protect, createPlan);
router.get("/plans/my", protect, getMyPlans);
router.get("/plans/for-mentee/:menteeId", protect, getPlansForMentee);
router.patch("/plans/:id/complete", protect, completePlan);

// Recommendations
router.post("/recommendations", protect, createRecommendation);
router.get("/recommendations/my", protect, getMyRecommendations);
router.get("/recommendations/for-mentee/:menteeId", protect, getRecommendationsForMentee);
router.patch("/recommendations/:id/complete", protect, completeRecommendation);

module.exports = router;
