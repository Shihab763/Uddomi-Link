const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Keeping these to match what you already inserted manually in MongoDB
    reporterRole: {
      type: String,
      enum: ["user", "business-owner", "ngo", "admin"],
      default: "user",
    },
    sellerRole: {
      type: String,
      enum: ["user", "business-owner", "ngo", "admin"],
      default: "business-owner",
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
