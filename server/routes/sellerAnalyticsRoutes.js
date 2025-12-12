const express = require('express');
const router = express.Router();
const { getSellerAnalytics } = require('../controllers/sellerAnalyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getSellerAnalytics);

module.exports = router;
