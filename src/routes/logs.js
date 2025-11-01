const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/logs - Log frontend errors
router.post('/', (req, res) => {
  try {
    const { error, stack, componentStack, timestamp, userAgent, url } = req.body;
    
    // Log the error with structured data
    logger.error({
      type: 'frontend_error',
      error: error,
      stack: stack,
      componentStack: componentStack,
      timestamp: timestamp,
      userAgent: userAgent,
      url: url,
      ip: req.ip
    }, 'Frontend error logged');

    res.status(200).json({
      success: true,
      message: 'Error logged successfully'
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to log frontend error');
    res.status(500).json({
      success: false,
      error: 'Failed to log error'
    });
  }
});

module.exports = router;
