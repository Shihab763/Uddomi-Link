const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createTraining,
  getPublishedTrainings,
  getMyNgoTrainings,
} = require("../controllers/trainingController");

// Public Skill Hub list
router.get("/", getPublishedTrainings);

// NGO list my trainings
router.get("/my", protect, getMyNgoTrainings);

// NGO create
router.post("/", protect, createTraining);

module.exports = router;
