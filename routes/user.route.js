const express = require('express');
const { meCtrl, userProfileImgCtrl } = require('../controllers/user.ctrl');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const router = express.Router();

router.get('/me', authMiddleware, meCtrl);
router.get('/admindashboard', authMiddleware, roleMiddleware('admin'), meCtrl);
router.put('/profile-image', authMiddleware, upload.single('profileImage'), userProfileImgCtrl);

module.exports = router;