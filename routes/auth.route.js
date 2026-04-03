const express = require('express');
const { signUpCtrl, signInCtrl, changePasswordCtrl, forgotPasswordCtrl, resetPasswordCtrl } = require('../controllers/auth.ctrl');
const upload = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/signup', upload.single('profileImage'), signUpCtrl);
router.post('/signin', signInCtrl);
router.post('/login', signInCtrl);
router.post('/change-password',authMiddleware, changePasswordCtrl);


router.post("/forgot-password", forgotPasswordCtrl);
router.post("/reset-password/:token", resetPasswordCtrl);

module.exports = router;