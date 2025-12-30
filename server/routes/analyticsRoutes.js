const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware'); 
const { requireAdmin } = require('../middleware/adminMiddleware'); 

router.get('/user', protect, analyticsController.getUserAnalytics);
router.get('/portfolio/:portfolioId', protect, analyticsController.getPortfolioAnalytics);
router.get('/search', protect, analyticsController.getSearchAnalytics);
router.get('/wishlist', protect, analyticsController.getWishlistAnalytics);
router.get('/admin', protect, requireAdmin, analyticsController.getAdminAnalytics);

module.exports = router;
