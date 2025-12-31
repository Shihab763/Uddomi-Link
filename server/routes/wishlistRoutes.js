const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyWishlist,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');

router.get('/my', protect, getMyWishlist);
router.get('/check/:itemType/:itemId', protect, checkWishlist);
router.post('/add', protect, addToWishlist);
router.post('/remove', protect, removeFromWishlist);

module.exports = router;
