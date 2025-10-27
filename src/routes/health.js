const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };

  logger.info({ healthData }, 'Health check requested');
  
  res.status(200).json(healthData);
});

module.exports = router;
