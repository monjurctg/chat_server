const { Op } = require('sequelize');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const sequelize = require('../config/database');



exports.getSuggestUser = async (req, res) => {
  try {
    const authUserId = req.user.id; // Authenticated user's ID

    // Find all friendships where the authenticated user is either sender or receiver
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { senderId: authUserId },
          { receiverId: authUserId },
        ],
      },
      attributes: ['senderId', 'receiverId', 'status'], // Include friendship status
    });

    // Extract IDs of friends or pending requests
    const excludedIds = friendships
      .filter(f => f.status === 'accepted')
      .map(f => (f.senderId === authUserId ? f.receiverId : f.senderId));

    // Add the authenticated user's ID to the exclusion list
    excludedIds.push(authUserId);

    // Fetch random users excluding self, friends, and those with pending requests
    const users = await User.findAll({
      where: {
        id: { [Op.notIn]: excludedIds },
      },
      attributes: { exclude: ['password'] }, // Exclude sensitive data
      order: sequelize.random(), // Randomize results
      limit: 10, // Adjust limit as needed
    });

    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getFriendList = async (req, res) => {
  const senderId = req.user.id

  console.log({senderId})
  try {
    const request = await Friendship.findOne({
      where: {
        [Op.or]: [
          { senderId,status:"accepted" },

        ],

      },
    });



    if (!request) {
      return res.json({ message: 'No User' });
    }


    res.status(200).json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Send Friend Request
exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id

  try {
    // Check if request already exists
    const existingRequest = await Friendship.findOne({
      where: {
        senderId,
        receiverId,
        status: 'pending',
      },
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Create the friendship request
    await Friendship.create({
      senderId,
      receiverId,
      status: 'pending',
    });

    res.status(200).json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Respond to Friend Request
exports.acceptFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id
  console.log({senderId,receiverId})
  try {
    const request = await Friendship.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId,status:"pending" },
          { senderId: receiverId, receiverId: senderId ,status:"pending" },
        ],

      },
    });



    if (!request) {
      return res.json({ message: 'Request not found' });
    }

    request.status = 'accepted';
    await request.save();
    await Friendship.create({
      senderId: receiverId,
      receiverId: senderId,
      status: 'accepted',
    });

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getFriendRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get all pending friend requests where the user is the receiver
    const requests = await Friendship.findAll({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      include: {
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'email'],
      },
    });

    res.status(200).json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List Friends
exports.listFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const friends = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'name'] },
      ],
    });

    res.status(200).json({ friends });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove Friend
exports.declineFriendRequest = async (req, res) => {
  const senderId = req.user.id
  const { receiverId } = req.body;



  try {

    const request = await Friendship.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId,status:"pending" },
          { senderId: receiverId, receiverId: senderId ,status:"pending" },
        ],
      },
    });

    if (!request) {
      return res.json({ message: 'Request not found' });
    }

    // Update the status to 'declined'
    await request.destroy();

    res.status(200).json({ message: 'Friend request declined' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getFriendshipStatus = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.query;

  if (!receiverId) {
    return res.status(400).json({ message: 'receiverId is required' });
  }

  try {
    // Check for friendship in both directions
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });


    if (!friendship) {
      return res.json({ status: 'none' });
    }

    return res.json({ status: friendship.status,senderId: friendship.senderId});
  } catch (error) {
    console.error('Error fetching friendship status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
