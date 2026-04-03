const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {getUsers,getMessages,sendMessage} = require('../controllers/chat.ctrl');

router.get('/users', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getMessages);
router.post('/send/:id', authMiddleware, sendMessage);

module.exports = router;
