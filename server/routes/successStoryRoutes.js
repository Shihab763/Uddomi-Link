const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getStories, createStory, deleteStory } = require('../controllers/successStoryController');

// All routes are protected (Logged in users only)
router.get('/', protect, getStories);
router.post('/', protect, admin, createStory);
router.delete('/:id', protect, admin, deleteStory);

module.exports = router;