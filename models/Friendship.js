const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending', // Default status is 'pending'
  },
}, {
  timestamps: true,  // Optional, adds createdAt/updatedAt fields
  indexes: [
    {
      unique: true,
      fields: ['senderId', 'receiverId'], // Enforcing uniqueness on the combination of senderId and receiverId
    },
  ],
});

module.exports = Friendship;
