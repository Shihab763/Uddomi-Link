const mongoose = require('mongoose');
const SearchIndex = require('./searchIndexModel');

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
    roles: [{
        type: String,
        enum: ['user', 'admin', 'business-owner', 'artist', 'ngo', 'investor'],
        default: ['user']
    }],
    profileImage: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
            city: { type: String, default: '' },
            district: { type: String, default: '' },
            streetAddress: { type: String, default: '' },

            type: {
                type: String, 
                enum: ['Point'], 
                default: 'Point'
            },
            coordinates: {
                type: [Number], 
                default: [0, 0]
            }

        },
    businessInfo: {
        name: { type: String, default: '' },
        type: { type: String, default: '' },
        yearsInBusiness: { type: Number, default: 0 }
    },
    acceptsBookings: {
        type: Boolean,
        default: false
    },
    acceptsCustomOrders: {
        type: Boolean,
        default: false
    },
    bookingPriceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    serviceTypes: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.post('save', async function(doc) {
    if (doc.roles && (doc.roles.includes('business-owner') || doc.roles.includes('artist'))) {
        await updateUserSearchIndex(doc);
    }
});

userSchema.post('findOneAndUpdate', async function(doc) {
    if (doc && doc.roles && (doc.roles.includes('business-owner') || doc.roles.includes('artist'))) {
        await updateUserSearchIndex(doc);
    }
});

userSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await SearchIndex.deleteMany({
            itemType: 'user',
            itemId: doc._id
        });
    }
});

async function updateUserSearchIndex(doc) {
  
    const searchData = {
        title: doc.name,
        description: doc.bio || '',
        category: doc.businessInfo?.type || 'creator',
        skills: doc.serviceTypes || [],
        location: doc.location || {}, 
        creator: doc._id,
        rating: { average: 0, count: 0 },
        acceptsCustomOrders: doc.acceptsCustomOrders,
        acceptsBookings: doc.acceptsBookings,
        isActive: doc.isActive,
        isApproved: doc.isVerified,
        lastUpdated: new Date()
    };

    
    if (doc.location && doc.location.coordinates) {
        searchData.location = {
            ...searchData.location, 
            type: 'Point',          
            coordinates: doc.location.coordinates
        };
    }

  
    try {
        await SearchIndex.findOneAndUpdate(
            {
                itemType: 'user',
                itemId: doc._id
            },
            searchData,
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Search Index Update Warning:", error.message);
      
    }
}
userSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('User', userSchema);
