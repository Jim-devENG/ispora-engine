const express = require('express');

const router = express.Router();

// Simple verify endpoint. This will only be reachable when Coming Soon gate
// allows the request (i.e., valid X-Dev-Key header or admin user).
// @route GET /api/dev/verify
router.get('/verify', (req, res) => {
  return res.status(200).json({ success: true, message: 'Dev key verified' });
});

module.exports = router;
