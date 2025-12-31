const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    mediaUrl: String,
    category: String,
    tags: [String],
    acceptsCustomOrders: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
