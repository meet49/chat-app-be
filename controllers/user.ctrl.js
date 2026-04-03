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

module.exports = {  meCtrl, userProfileImgCtrl };