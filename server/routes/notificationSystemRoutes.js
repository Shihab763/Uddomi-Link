const express = require('express');
const router = express.Router();
const { 
    getNotifications, 
    markAsRead, 
    markAllAsRead,
    getUnreadCount 
} = require('../controllers/notificationSystemController'); // Importing from the NEW controller name

const { createNotification } = require('../utils/notificationSystemHelper'); // Importing from the NEW helper name
const { protect } = require('../middleware/authMiddleware'); 

router.use(protect);


router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;