const SuccessStory = require('../models/successStoryModel');

// @desc    Get all stories (Protected: Logged in users only)
const getStories = async (req, res) => {
    try {
        const stories = await SuccessStory.find({ isShowcased: true }).sort({ createdAt: -1 });
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a story (Admin only)
const createStory = async (req, res) => {
    try {
        const story = await SuccessStory.create(req.body);
        res.status(201).json(story);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteStory = async (req, res) => {
    try {
        await SuccessStory.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Story deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStories, createStory, deleteStory };