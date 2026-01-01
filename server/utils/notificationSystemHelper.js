const NotificationSystem = require('../models/notificationSystemModel');

const createNotification = async (data) => {
    try {
        await NotificationSystem.create({
            recipient: data.recipient,
            sender: data.sender || null,
            title: data.title,
            message: data.message,
            type: data.type || 'system',
            link: data.link || '',
            relatedId: data.relatedId || null
        });
    } catch (error) {
        console.error('Notification System Error:', error.message);
    }
};

module.exports = { createNotification };