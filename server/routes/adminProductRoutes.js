const express = require('express');
const router = express.Router();
const {
    getPendingProducts,
    approveProduct,
    rejectProduct,
    getAllProductsAdmin
} = require('../controllers/adminProductController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.get('/products/pending', protect, requireAdmin, getPendingProducts);
router.get('/products/all', protect, requireAdmin, getAllProductsAdmin);
router.put('/products/:id/approve', protect, requireAdmin, approveProduct);
router.put('/products/:id/reject', protect, requireAdmin, rejectProduct);

module.exports = router;
