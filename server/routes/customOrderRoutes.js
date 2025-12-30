const express = require('express');
const router = express.Router();
const {
    createCustomOrder,
    getMyCustomOrders,
    getCustomOrderById,
    updateCustomOrderStatus,
    addMessageToOrder,
    rateCustomOrder
} = require('../controllers/customOrderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCustomOrder);
router.get('/my-orders', protect, getMyCustomOrders);
router.get('/:id', protect, getCustomOrderById);
router.put('/:id/status', protect, updateCustomOrderStatus);
router.post('/:id/message', protect, addMessageToOrder);
router.post('/:id/rate', protect, rateCustomOrder);

module.exports = router;
