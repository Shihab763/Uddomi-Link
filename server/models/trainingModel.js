const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    contentType: {
      type: String,
      enum: ["video", "workshop"],
      default: "video",
    },

    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: "", trim: true },

    tags: [{ type: String, trim: true }],

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: { type: String, default: "Bangla", trim: true },

    createdByNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: { type: Boolean, default: true },
    durationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Training", trainingSchema);
