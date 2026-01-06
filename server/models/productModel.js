const mongoose = require('mongoose');
const SearchIndex = require('./searchIndexModel');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['handicrafts', 'textiles', 'pottery', 'jewelry', 'food', 'furniture', 'other']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: 0,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


productSchema.post('save', async function(doc) {
    await updateProductSearchIndex(doc);
});

productSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        await updateProductSearchIndex(doc);
    }
});

productSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await SearchIndex.deleteOne({
            itemType: 'product',
            itemId: doc._id
        });
    }
});

async function updateProductSearchIndex(doc) {
    const User = require('./userModel');
    const seller = await User.findById(doc.seller);
    
    const availability = doc.stock > 10 ? 'available' : 
                        doc.stock > 0 ? 'limited' : 'unavailable';

    const searchData = {
        title: doc.name,
        description: doc.description,
        category: doc.category,
        price: doc.price,
        location: seller?.location || {},
        creator: doc.seller,
        rating: doc.rating,
        availability: availability,
        isActive: doc.isActive,
        isApproved: doc.isApproved,
        lastUpdated: new Date()
    };

    if (seller?.location?.coordinates) {
        searchData.location = {
            ...searchData.location,
            coordinates: seller.location.coordinates
        };
    }

    await SearchIndex.findOneAndUpdate(
        {
            itemType: 'product',
            itemId: doc._id
        },
        searchData,
        { upsert: true, new: true }
    );
}

module.exports = mongoose.model('Product', productSchema);
