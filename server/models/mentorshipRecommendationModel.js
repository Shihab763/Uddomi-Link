const mongoose = require("mongoose");

const mentorshipRecommendationSchema = new mongoose.Schema(
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
    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training",
      required: true,
    },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["incomplete", "complete"],
      default: "incomplete",
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipRecommendation", mentorshipRecommendationSchema);
