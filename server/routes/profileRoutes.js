const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateProfile,
    getAllSellers
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/optionalAuthMiddleware');

// Public routes (with optional auth for view tracking)
router.get('/sellers', getAllSellers);
router.get('/:userId', optionalAuth, getUserProfile);

// Private routes
router.get('/me/profile', protect, getMyProfile);
router.put('/me', protect, updateProfile);

module.exports = router;
