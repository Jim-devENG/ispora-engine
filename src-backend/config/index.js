require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'https://ispora.app',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  database: {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection: process.env.DATABASE_URL || {
      filename: './data/dev.db'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    },
    pool: {
      min: 2,
      max: 10
    }
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN || null
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

// Ensure data directory exists for SQLite in development
if (config.nodeEnv === 'development' && config.database.client === 'sqlite3') {
  const fs = require('fs');
  const path = require('path');
  const dataDir = path.dirname(config.database.connection.filename);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }
}

module.exports = config;
