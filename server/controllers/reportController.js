const Report = require("../models/reportModel");
const User = require("../models/userModel");

// helper: pick a single "primary" role to store in reporterRole/sellerRole
function pickPrimaryRole(roles = []) {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("business-owner")) return "business-owner";
  if (roles.includes("ngo")) return "ngo";
  return "user";
}

// POST /api/reports  (logged-in user creates report)
const createReport = async (req, res) => {
  try {
    console.log("✅ REPORT ENDPOINT HIT");
    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user);

    const { sellerId, reason, details } = req.body;

    if (!sellerId || !reason) {
      return res.status(400).json({ message: "sellerId and reason are required." });
    }

    // Prevent reporting self
    if (req.user && req.user._id && req.user._id.toString() === sellerId.toString()) {
      console.log("❌ User tried to report themselves:", sellerId);
  
      return res.status(400).json({ message: "You cannot report yourself." });
    }

    const seller = await User.findById(sellerId).select("roles name email");
    console.log("SELLER FOUND:", seller);

    if (!seller) {
      console.log("❌ Seller not found for sellerId:", sellerId);
  
      return res.status(404).json({ message: "Seller not found." });
    }

    // Must be a business-owner
    if (!seller.roles || !seller.roles.includes("business-owner")) {
      console.log("❌ Not a business-owner. Seller roles:", seller.roles);
  
      return res.status(400).json({ message: "This user is not a business-owner seller." });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      sellerId: seller._id,
      reporterRole: pickPrimaryRole(req.user.roles || []),
      sellerRole: pickPrimaryRole(seller.roles || []),
      reason,
      details: details || "",
      status: "pending",
    });
    console.log("✅ REPORT CREATED IN DB. ID:", report._id);

    return res.status(201).json({ message: "Report submitted.", report });
  } catch (error) {
    console.error("createReport error:", error);
    return res.status(500).json({ message: "Server error creating report." });
  }
};

// GET /api/reports  (admin only - list reports)
const getAllReports = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate("reporterId", "name email roles")
      .populate("sellerId", "name email roles");

    return res.json(reports);
  } catch (error) {
    console.error("getAllReports error:", error);
    return res.status(500).json({ message: "Server error fetching reports." });
  }
};

// PATCH /api/reports/:id  (admin only - update status/adminNote)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const allowed = ["pending", "reviewed", "resolved"];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    if (status) report.status = status;
    if (typeof adminNote === "string") report.adminNote = adminNote;

    await report.save();

    return res.json({ message: "Report updated.", report });
  } catch (error) {
    console.error("updateReport error:", error);
    return res.status(500).json({ message: "Server error updating report." });
  }
};

module.exports = {
  createReport,
  getAllReports,
  updateReport,
};
