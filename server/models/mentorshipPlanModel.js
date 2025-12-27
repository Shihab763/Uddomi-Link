const mongoose = require("mongoose");

const mentorshipPlanSchema = new mongoose.Schema(
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
    title: { type: String, required: true, trim: true },
    steps: [{ type: String, trim: true }],
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["incomplete", "complete"],
      default: "incomplete",
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipPlan", mentorshipPlanSchema);
