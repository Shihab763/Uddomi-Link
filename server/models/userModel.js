const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  roles: {
    type: [String],
    enum: ['user', 'business-owner', 'investor', 'admin'],
    default: ['user']
  },
  profile: {
    bio: String,
    profilePicture: String,
    coverPhoto: String,

    // Contact Info
    phone: String,
    address: {
      street: String,
      city: String,
      district: String,
      country: { type: String, default: 'Bangladesh' }
    },

    // Social Links
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      website: String
    },

    // Business Info, business-owners view
    businessName: String,
    businessType: String,
    yearsInBusiness: Number,

    // Stats
    profileViews: { type: Number, default: 0 },
    lastUpdated: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);