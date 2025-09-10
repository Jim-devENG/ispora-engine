const path = require('path');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../../data/ispora.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds')
    }
  },
  
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds')
    }
  },
  
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ispora_prod',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '../database/migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../database/seeds')
    }
  }
};

module.exports = config;
