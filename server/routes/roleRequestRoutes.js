const express = require('express');
const router = express.Router();
const {
    createRoleRequest,
    getPendingRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/roleRequestController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.post('/', protect, createRoleRequest);
router.get('/pending', protect, requireAdmin, getPendingRequests);
router.put('/:id/approve', protect, requireAdmin, approveRequest);
router.put('/:id/reject', protect, requireAdmin, rejectRequest);

module.exports = router;
