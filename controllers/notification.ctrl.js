
const sendNotification = async (req, res) => {
    try {
        const { title, message, userId } = req.body;

        // If userId is provided, send to that specific user (room)
        // If not, send to everyone
        if (userId) {
            req.io.to(userId).emit('notification', { title, message });
        } else {
            req.io.emit('notification', { title, message });
        }

        res.status(200).json({
            success: true,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { sendNotification };