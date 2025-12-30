const express = require('express');
const router = express.Router();
const {
    getUserAnalytics,
    getPortfolioAnalytics,
    getSearchAnalytics,
    getWishlistAnalytics,
    getAdminAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

router.get('/user', protect, getUserAnalytics);
router.get('/portfolio/:portfolioId', protect, getPortfolioAnalytics);
router.get('/search', protect, getSearchAnalytics);
router.get('/wishlist', protect, getWishlistAnalytics);
router.get('/admin', protect, adminMiddleware, getAdminAnalytics);

module.exports = router;
