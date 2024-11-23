const express = require('express');
const { getMessages,getChatList } = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/:chatType/:id', authMiddleware, getMessages);
router.get('/list', authMiddleware, getChatList);

module.exports = router;
