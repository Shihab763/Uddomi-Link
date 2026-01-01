const NotificationSystem = require('../models/notificationSystemModel');

const getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationSystem.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const count = await NotificationSystem.countDocuments({ 
            recipient: req.user._id, 
            isRead: false 
        });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await NotificationSystem.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await NotificationSystem.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};