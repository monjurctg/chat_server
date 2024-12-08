const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');


const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['senderId', 'receiverId'],
    },
  ],
});




// Hook to prevent reverse duplicates
// Friendship.beforeValidate(async (friendship) => {
//   const reverseExists = await Friendship.findOne({
//     where: {
//       senderId: friendship.receiverId,
//       receiverId: friendship.senderId,
//     },
//   });
//   if (reverseExists) {
//     throw new Error('Friendship already exists in reverse!');
//   }
// });

// Optional: Validate user existence
Friendship.beforeCreate(async (friendship) => {
  // console.log({friendship})
  // const senderExists = await User.findByPk(friendship.senderId);
  // const receiverExists = await User.findByPk(friendship.receiverId);

  // if (!senderExists || !receiverExists) {
  //   throw new Error('Sender or Receiver does not exist.');
  // }
});

module.exports = Friendship;
