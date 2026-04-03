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
        const users = await signUp.find({ isDeleted: false }).select('-password');
        res.status(200).json(users);
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

module.exports = {  meCtrl, userProfileImgCtrl, usersListCtrl, deleteUserCtrl };