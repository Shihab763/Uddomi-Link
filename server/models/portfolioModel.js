const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, 
  additionalImages: [String], 
  completionDate: { type: Date },
  tags: [String], 
  clientName: { type: String } 
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true 
    },
    bio: { type: String, default: "Crafting with passion." },
    skills: [String],
    experienceYears: { type: Number, default: 0 },
    videoIntro: { type: String }, 
    projects: [projectSchema], 
    awards: [{
      title: String,
      year: Number,
      issuer: String
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
