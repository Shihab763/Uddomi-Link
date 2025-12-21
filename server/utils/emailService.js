// Dummy email service that does nothing (no errors)
module.exports = {
    sendNotification: async () => {
        console.log('🔔 [DUMMY] Notification logged');
        return true;
    },
    sendEmail: async () => {
        console.log('📧 [DUMMY] Email would be sent');
        return true;
    }
};
