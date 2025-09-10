const knex = require('knex');
const config = require('../config/database');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection established successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;
