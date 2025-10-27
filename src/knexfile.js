const path = require('path');
const config = require('./config');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../data/dev.db')
    },
    migrations: {
      directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ispora',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    useNullAsDefault: true
  }
};
