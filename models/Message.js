const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  readStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Message;
