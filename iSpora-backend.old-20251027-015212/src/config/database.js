const path = require('path');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../../data/ispora.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../database/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds'),
    },
  },

  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../database/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds'),
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL || path.join(__dirname, '../../data/ispora_prod.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../database/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds'),
    },
  },
};

module.exports = config;
