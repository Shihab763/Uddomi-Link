const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createCustomOrder, 
    getReceivedOrders, 
    getSentOrders, 
    updateOrderStatus 
} = require('../controllers/customOrderController');

router.post('/', protect, createCustomOrder);
router.get('/received', protect, getReceivedOrders); // For Sellers
router.get('/sent', protect, getSentOrders);         // For Buyers
router.patch('/:id/status', protect, updateOrderStatus); // Accept/Reject

module.exports = router;
