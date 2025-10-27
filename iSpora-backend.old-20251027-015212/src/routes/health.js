const express = require('express');
const router = express.Router();

// @desc    Health check
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  console.log('🔍 Health check requested');
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

module.exports = router;
