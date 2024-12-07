const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Friendship = require('./Friendship'); // Friendship model reference

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  // Add timestamps if needed
  timestamps: true,
});

// Associations
User.hasMany(Friendship, { foreignKey: 'senderId', as: 'sentRequests' });
User.hasMany(Friendship, { foreignKey: 'receiverId', as: 'receivedRequests' });

Friendship.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Friendship.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });



module.exports = User;
