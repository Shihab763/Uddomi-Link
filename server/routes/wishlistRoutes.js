const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.get('/my', protect, getMyWishlist);
router.post('/add', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
