const express = require('express');
const router = express.Router();

const { listFriends,acceptFriendRequest,sendFriendRequest,declineFriendRequest,getAllUser } = require('../controllers/friendshipController');



// Send Friend Request
router.post('/sendRequest', sendFriendRequest);
router.get('/all', getAllUser);

// Respond to Friend Request (Accept/Decline)
router.post('/respondRequest', acceptFriendRequest);

// List Friends
router.get('/listFriends/:userId', listFriends);

// Remove Friend
router.delete('/removeFriend', declineFriendRequest);

module.exports = router;
