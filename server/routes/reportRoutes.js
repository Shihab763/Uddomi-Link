const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const {
  createReport,
  getAllReports,
  updateReport,
} = require("../controllers/reportController");

// User: create report
router.post("/", protect, createReport);

// Admin: list reports
router.get("/", protect, requireAdmin, getAllReports);

// Admin: update report
router.patch("/:id", protect, requireAdmin, updateReport);

module.exports = router;
