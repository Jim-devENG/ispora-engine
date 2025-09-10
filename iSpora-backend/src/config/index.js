require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_for_ispora_app_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_token_secret_for_ispora_2024'
  },
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'sqlite:./data/ispora.db'
  },
  
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  
  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@ispora.com'
  },
  
  // File Upload Configuration
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx').split(',')
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'dev_session_secret_for_ispora_2024'
  },
  
  // AWS Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || ''
  },
  
  // External API Keys
  apiKeys: {
    googleCalendar: process.env.GOOGLE_CALENDAR_API_KEY || '',
    zoomApiKey: process.env.ZOOM_API_KEY || '',
    zoomApiSecret: process.env.ZOOM_API_SECRET || ''
  }
};

module.exports = config;
