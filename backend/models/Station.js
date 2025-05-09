const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Station = sequelize.define('Station', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  totalChargers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  availableChargers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  pricing: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  chargerTypes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = Station; 