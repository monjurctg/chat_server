const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { listFriends,acceptFriendRequest,sendFriendRequest,declineFriendRequest,getSuggestUser, getFriendshipStatus, getFriendList } = require('../controllers/friendshipController');



// Send Friend Request
router.post('/sendRequest',authMiddleware, sendFriendRequest);
router.get('/suggest_user',authMiddleware, getSuggestUser);
// router.get('/suggest_user', getSuggestUser);


// Respond to Friend Request (Accept/Decline)
router.post('/respondRequest',authMiddleware, acceptFriendRequest);

// List Friends
router.get('/listFriends/:userId',authMiddleware, listFriends);

// Remove Friend
router.post('/removeFriend',authMiddleware, declineFriendRequest);
router.get('/friend_status',authMiddleware, getFriendshipStatus);
router.get('/friend-list',authMiddleware, getFriendList);

getFriendList

module.exports = router;
