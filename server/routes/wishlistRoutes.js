const express = require('express');
const router = express.Router();
const {
    getMyWishlist,
    addToWishlist,
    removeFromWishlist,
    createWishlistCategory,
    addItemToCategory
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyWishlist);
router.post('/add', protect, addToWishlist);
router.delete('/remove/:itemType/:itemId', protect, removeFromWishlist);
router.post('/categories', protect, createWishlistCategory);
router.post('/categories/add-item', protect, addItemToCategory);

module.exports = router;
