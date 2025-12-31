const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
    },
    details: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomOrder', customOrderSchema);
