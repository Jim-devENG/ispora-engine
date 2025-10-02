const express = require('express');
const router = express.Router();

// Simple CORS test endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin'),
    headers: req.headers
  });
});

// OPTIONS handler for preflight requests
router.options('/', (req, res) => {
  res.status(200).end();
});

module.exports = router;
