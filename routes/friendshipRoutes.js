const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { listFriends,acceptFriendRequest,sendFriendRequest,declineFriendRequest,getSuggestUser, getFriendshipStatus } = require('../controllers/friendshipController');



// Send Friend Request
router.post('/sendRequest',authMiddleware, sendFriendRequest);
router.get('/suggest_user',authMiddleware, getSuggestUser);

// Respond to Friend Request (Accept/Decline)
router.post('/respondRequest',authMiddleware, acceptFriendRequest);

// List Friends
router.get('/listFriends/:userId',authMiddleware, listFriends);

// Remove Friend
router.delete('/removeFriend',authMiddleware, declineFriendRequest);
router.get('/friend_status',authMiddleware, getFriendshipStatus);



module.exports = router;
