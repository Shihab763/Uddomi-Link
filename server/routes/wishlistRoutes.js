const express = require('express');
const router = express.Router();
const {
    addToWishlist,
    removeFromWishlist,
    getMyWishlist,
    checkInWishlist,
    clearWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addToWishlist);
router.post('/remove', protect, removeFromWishlist);
router.get('/my', protect, getMyWishlist);
router.get('/check/:itemType/:itemId', protect, checkInWishlist);
router.delete('/clear', protect, clearWishlist);

module.exports = router;
