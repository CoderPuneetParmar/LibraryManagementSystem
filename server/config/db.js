const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sslRequired = (process.env.DB_SSL_REQUIRED || 'true').toLowerCase() === 'true';
const sslCaPath = process.env.DB_SSL_CA;

if (sslRequired && !sslCaPath) {
  throw new Error('DB_SSL_CA environment variable is required when DB_SSL_REQUIRED=true');
}

const dialectOptions = sslRequired
  ? {
      ssl: {
        ca: fs.readFileSync(path.resolve(sslCaPath), 'utf8'),
        rejectUnauthorized: true
      }
    }
  : undefined;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'library_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log for debugging SQL queries
    dialectOptions,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
