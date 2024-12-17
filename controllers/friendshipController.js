const { Op } = require('sequelize');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const sequelize = require('../config/database');



// exports.getSuggestUser = async (req, res) => {
//   try {
//     const authUserId = req.user.id;
//     const friendships = await Friendship.findAll({
//       where: {
//         [Op.or]: [
//           { senderId: authUserId },
//           { receiverId: authUserId },
//         ],
//       },
//       attributes: ['senderId', 'receiverId', 'status'],
//     });

//     // Extract IDs of friends or pending requests
//     const excludedIds = friendships
//       .filter(f => f.status === 'accepted')
//       .map(f => (f.senderId === authUserId ? f.receiverId : f.senderId));
//     excludedIds.push(authUserId);
//     const users = await User.findAll({
//       where: {
//         id: { [Op.notIn]: excludedIds },
//       },
//       attributes: { exclude: ['password'] },
//       order: sequelize.random(),
//       limit: 10,
//     });

//     res.json(users);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// };


exports.getSuggestUser = async (req, res) => {
  try {
    const authUserId = req.user.id;

    // Fetch all friendships of the authenticated user
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { senderId: authUserId },
          { receiverId: authUserId },
        ],
      },
      attributes: ['senderId', 'receiverId'],
    });

    // Extract IDs of all related users (sender and receiver)
    const excludedIds = friendships.map(f =>
      f.senderId === authUserId ? f.receiverId : f.senderId
    );
    excludedIds.push(authUserId); // Exclude the authenticated user as well

    // Fetch suggested users excluding the excludedIds
    const users = await User.findAll({
      where: {
        id: { [Op.notIn]: excludedIds }, // Exclude friends and pending users
      },
      attributes: { exclude: ['password'] }, // Do not include the password field
      order: sequelize.random(), // Randomize the order of users
      limit: 10, // Limit the number of results
    });

    res.json(users); // Send the suggested users as the response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFriendList = async (req, res) => {
  const userId = req.user.id; // Current logged-in user ID

  try {
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'sender', // Include the sender details
          attributes: ['id', 'name', 'phone', 'email'],
        },
        {
          model: User,
          as: 'receiver', // Include the receiver details
          attributes: ['id', 'name', 'phone', 'email'],
        },
      ],
    });

    // Format the friends list to only include unique users
    const friendsMap = new Map();

    friendships.forEach(friendship => {
      if (friendship.senderId === userId) {
        friendsMap.set(friendship.receiver.id, friendship.receiver);
      } else {
        friendsMap.set(friendship.sender.id, friendship.sender);
      }
    });

    // Convert the Map values into an array
    const friends = Array.from(friendsMap.values());

    if (friends.length === 0) {
      return res.json({ message: 'No friends found' });
    }

    res.status(200).json({ friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while fetching the friend list.' });
  }
};



// exports.getFriendList = async (req, res) => {
//   const senderId = req.user.id;

//   try {
//     const friendships = await Friendship.findAll({
//       where: {
//         senderId,
//         status: 'accepted',
//       },
//       include: [
//         {
//           model: User,
//           as: 'receiver',
//           attributes: ['id', 'name', 'phone', 'email'],
//         }
//       ],
//     });

//     if (friendships.length === 0) {
//       return res.json({ message: 'No friends found' });
//     }


//     res.status(200).json({ friends:friendships });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// };




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
  const { receiverId } = req.body; // The person who sent the original request
  const senderId = req.user.id; // The person accepting the request

  try {
    // Find the pending friend request
    const request = await Friendship.findOne({
      where: {
        [Op.or]: [
          // { senderId, receiverId, status: "pending" },
          { senderId: receiverId, receiverId: senderId, status: "pending" },
        ],
      },
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Update the original request status to 'accepted'
    request.status = "accepted";
    await request.save();

    // Check if the reverse relationship already exists
    const reverseRequestExists = await Friendship.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
        ],
      },
    });
console.log({reverseRequestExists})

    if (!reverseRequestExists) {
      console.log("not exit")

      await Friendship.create({
        senderId:senderId,
        receiverId:receiverId,
        status: "accepted",
      });
    }

    res.status(200).json({
      message: "Friend request accepted",
      friendship: request,
    });
  } catch (err) {
    console.error("Error accepting friend request:", err);
    res.status(500).json({ message: "An error occurred while accepting the request" });
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
