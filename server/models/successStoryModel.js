const mongoose = require('mongoose');

const successStorySchema = mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    featuredUser: { type: String, required: true }, // Name of the person
    image: { type: String, required: true }, // URL to image
    isShowcased: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('SuccessStory', successStorySchema);