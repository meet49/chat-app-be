const signUp = require("../models/auth.model");

const meCtrl = async (req, res) => {
    try {
        const user = await signUp.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const userProfileImgCtrl = async (req, res) => {
    try {
        const user = await signUp.findById(req.user.id);
        user.profileImage = req.file.path;
        await user.save();
        res.status(200).json({ message: 'Profile image updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const usersListCtrl = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { isDeleted: false };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await signUp.find(query).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

    const updateUserCtrl = async (req, res) => {
        try {
            const { username, email, role } = req.body;
            const userId = req.params.id;

            const user = await signUp.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (email) {
                const emailClean = email.trim().toLowerCase();
                console.log(emailClean);
                const isExist = await signUp.findOne({ 
                    email: emailClean, 
                    _id: { $ne: userId } 
                });
                console.log(isExist);
                if (isExist) {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                user.email = emailClean;
            }

            // Update other allowed fields
            if (username) user.username = username;
            if (role) {
                if (["user", "admin"].includes(role)) {
                    user.role = role;
                } else {
                    return res.status(400).json({ message: 'Invalid role' });
                }
            }

            await user.save();

            res.status(200).json({ 
                message: 'User updated successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Server Error' });
        }
    };

const deleteUserCtrl = async (req, res) => {
    try {
        const user = await signUp.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {  meCtrl, userProfileImgCtrl, usersListCtrl, deleteUserCtrl, updateUserCtrl };