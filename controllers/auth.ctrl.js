const bcrypt = require('bcrypt');
const signUp = require('../models/auth.model');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

const signUpCtrl = async (req, res) => {
  try {
    const parsedData = JSON.parse(req.body.data);

    const { username, email, password, role } = parsedData;

    const emailClean = email.trim().toLowerCase();

    const profileImage = req.file?.path;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const isExist = await signUp.findOne({ email: emailClean });

    if (isExist) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new signUp({
      username,
      email: emailClean,
      password: hashPassword,
      role,
      profileImage
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.log(error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid JSON in 'data'" });
    }

    res.status(500).json({ message: 'Server Error' });
  }
};

const signInCtrl = async (req, res) => {
  try{
    const {email, password} = req.body;
    const emailClean = email.trim().toLowerCase();
    if(!email || !password){
      return res.status(400).json({message: 'All fields are required'});
    }
    const user = await signUp.findOne({email: emailClean, isDeleted: false});
    if(!user){
      return res.status(400).json({message: 'User not found'});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({message: 'Invalid credentials'});
    }

    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

    res.status(200).json({message: 'Login successful', token, user });
  }catch(error){
    console.log(error);
    res.status(500).json({message: 'Server Error'});
  }
};

const changePasswordCtrl = async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;    
    const userId = req.user.id;
    const user = await signUp.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const forgotPasswordCtrl = async (req, res) => {
  try {
    const { email } = req.body;
    const emailClean = email.trim().toLowerCase();
    
    if(!email){
      return res.status(400).json({message: 'Email is required'});
    }

    const user = await signUp.findOne({email: emailClean, isDeleted: false});
    if(!user){
      return res.status(400).json({message: 'User with this email does not exist'});
    }

    // Generate JWT token for reset
    const resetToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30m' }
    );

    // Save token to DB (optional but good for tracking/revocation)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1800000; // 30 mins

    await user.save();

    // Construct reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you requested the reset of the password for your account.</p>
      <p>This link is valid for 30 minutes.</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(
      emailClean,
      "Password Reset Request",
      message
    );

    res.status(200).json({message: 'Password reset link sent to your email'});
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Server Error'});
  }
};

const resetPasswordCtrl = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await signUp.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found or token has been used' });
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { signUpCtrl, signInCtrl, changePasswordCtrl, forgotPasswordCtrl, resetPasswordCtrl };