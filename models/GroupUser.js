const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupUser = sequelize.define('GroupUser', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

});

module.exports = GroupUser;
