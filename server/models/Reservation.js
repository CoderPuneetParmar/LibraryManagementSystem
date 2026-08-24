const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reservation_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ready_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('waiting', 'ready', 'expired', 'cancelled', 'fulfilled'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  queue_position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'reservations',
  timestamps: true
});

module.exports = Reservation;
