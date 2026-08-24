const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ebook = sequelize.define('Ebook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: {
    type: DataTypes.ENUM('pdf', 'epub'),
    allowNull: false,
    defaultValue: 'pdf'
  }
}, {
  tableName: 'ebooks',
  timestamps: true
});

module.exports = Ebook;
