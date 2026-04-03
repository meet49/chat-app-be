const User = require('../models/auth.model');
const Message = require('../models/message.model');

// Fetch all users except the current user
exports.getUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // User ID from the JWT token
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }, isDeleted: false }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsers: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Fetch chat messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        console.log("userToChatId",userToChatId);
        const senderId = req.user.id;
        console.log("senderId",senderId);
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: userToChatId },
                { sender: userToChatId, receiver: senderId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Send a message via API (optional if the socket is used, but good for persistence/initial setup)
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        console.log("receiverId",receiverId);
        const senderId = req.user.id;
        console.log("senderId",senderId);

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message,
        });

        await newMessage.save();

        // Trigger Socket.io event for the recipient
        if (req.io) {
            req.io.to(receiverId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
