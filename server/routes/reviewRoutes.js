const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    adminDeleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Public routes
router.get('/product/:productId', getProductReviews);

// Authenticated routes
router.post('/', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

// Admin routes
router.delete('/admin/:reviewId', protect, requireAdmin, adminDeleteReview);

module.exports = router;
