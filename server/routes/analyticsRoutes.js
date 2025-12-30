const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/user', auth, analyticsController.getUserAnalytics);
router.get('/portfolio/:portfolioId', auth, analyticsController.getPortfolioAnalytics);
router.get('/search', auth, analyticsController.getSearchAnalytics);
router.get('/wishlist', auth, analyticsController.getWishlistAnalytics);
router.get('/admin', auth, analyticsController.getAdminAnalytics);

module.exports = router;
