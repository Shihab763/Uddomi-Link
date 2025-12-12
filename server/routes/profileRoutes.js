const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateProfile,
    getAllSellers
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/sellers', getAllSellers);
router.get('/:userId', getUserProfile);

// Private routes
router.get('/me/profile', protect, getMyProfile);
router.put('/me', protect, updateProfile);

module.exports = router;
