const Training = require("../models/trainingModel");

// NGO: create a training
const createTraining = async (req, res) => {
  try {
    // Only NGO can create
    const isNgo = req.user?.roles?.includes("ngo");
    if (!isNgo) {
      return res.status(403).json({ message: "Only NGOs can create trainings." });
    }

    const {
      title,
      description,
      contentType,
      videoUrl,
      thumbnailUrl,
      tags,
      level,
      language,
      durationMinutes,
      isPublished,
    } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ message: "title and videoUrl are required." });
    }

    const training = await Training.create({
      title,
      description: description || "",
      contentType: contentType || "video",
      videoUrl,
      thumbnailUrl: thumbnailUrl || "",
      tags: Array.isArray(tags) ? tags : [],
      level: level || "beginner",
      language: language || "Bangla",
      durationMinutes: Number(durationMinutes) || 0,
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
      createdByNgoId: req.user._id,
    });

    res.status(201).json(training);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Public: list all published trainings (Skill Hub)
const getPublishedTrainings = async (req, res) => {
  try {
    const trainings = await Training.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("createdByNgoId", "name email roles profile");

    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NGO: list my trainings
const getMyNgoTrainings = async (req, res) => {
  try {
    const isNgo = req.user?.roles?.includes("ngo");
    if (!isNgo) {
      return res.status(403).json({ message: "Only NGOs can view their trainings." });
    }

    const trainings = await Training.find({ createdByNgoId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createTraining, getPublishedTrainings, getMyNgoTrainings };
