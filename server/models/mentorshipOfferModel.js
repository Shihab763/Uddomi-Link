const mongoose = require("mongoose");

const mentorshipOfferSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    // ✅ NEW: mentorship can be ended by either side
    endedAt: {
      type: Date,
      default: null,
    },
    endedBy: {
      type: String,
      enum: ["ngo", "business-owner", "system"],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipOffer", mentorshipOfferSchema);

