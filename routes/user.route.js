const express = require('express');
const { meCtrl, userProfileImgCtrl, usersListCtrl, deleteUserCtrl } = require('../controllers/user.ctrl');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const router = express.Router();

router.get('/me', authMiddleware, meCtrl);
router.get('/admindashboard', authMiddleware, roleMiddleware('admin'), meCtrl);
router.put('/profile-image', authMiddleware, upload.single('profileImage'), userProfileImgCtrl);
router.get('/users-list', authMiddleware, usersListCtrl);
router.delete('/delete-user/:id', authMiddleware, deleteUserCtrl);

module.exports = router;