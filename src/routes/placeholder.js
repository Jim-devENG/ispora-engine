const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/placeholder/:width/:height - Redirect to placehold.co (NO FALLBACKS)
router.get('/:width/:height', (req, res) => {
  // 🛡️ DevOps Guardian: Allow no-origin requests (for image tags, etc.)
  const origin = req.headers.origin;
  const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
  
  // Set CORS headers - allow no-origin for image requests
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      // Allow no-origin for direct image requests
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    // Block unknown origins
    console.error(`[PLACEHOLDER] ❌ CORS blocked: ${origin}`);
    return res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed',
      allowedOrigins
    });
  }
  
  const { width, height } = req.params;
  const { text } = req.query;
  
  // Validate dimensions - explicit validation, throw on error
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  
  if (isNaN(w) || isNaN(h) || w < 1 || h < 1 || w > 2000 || h > 2000) {
    console.error(`[PLACEHOLDER] ❌ Invalid dimensions: ${width}x${height}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid dimensions. Width and height must be numbers between 1 and 2000',
      received: { width, height }
    });
  }
  
  // Direct redirect to placehold.co - NO FALLBACKS, NO TRY/CATCH SWALLOWING ERRORS
  const placeholderText = text ? encodeURIComponent(text) : '+';
  const placeholderUrl = `https://placehold.co/${w}x${h}?text=${placeholderText}`;
  
  console.log(`[PLACEHOLDER] ✅ Redirecting to: ${placeholderUrl}`);
  logger.info({ width: w, height: h, url: placeholderUrl }, 'Placeholder redirect');
  
  // Direct redirect - no error handling needed, Express handles it
  res.redirect(302, placeholderUrl);
});

// GET /api/placeholder/:size - Redirect to square placeholder (NO FALLBACKS)
router.get('/:size', (req, res) => {
  // 🛡️ DevOps Guardian: Allow no-origin requests (for image tags, etc.)
  const origin = req.headers.origin;
  const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
  
  // Set CORS headers - allow no-origin for image requests
  if (!origin || allowedOrigins.includes(origin)) {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      // Allow no-origin for direct image requests
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    // Block unknown origins
    console.error(`[PLACEHOLDER] ❌ CORS blocked: ${origin}`);
    return res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed',
      allowedOrigins
    });
  }
  
  const { size } = req.params;
  const s = parseInt(size, 10);
  
  // Explicit validation - throw on error
  if (isNaN(s) || s < 1 || s > 2000) {
    console.error(`[PLACEHOLDER] ❌ Invalid size: ${size}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid size. Size must be a number between 1 and 2000',
      received: { size }
    });
  }
  
  // Direct redirect to placehold.co for square placeholder - NO FALLBACKS
  const placeholderUrl = `https://placehold.co/${s}x${s}?text=+`;
  
  console.log(`[PLACEHOLDER] ✅ Redirecting to: ${placeholderUrl}`);
  logger.info({ size: s, url: placeholderUrl }, 'Square placeholder redirect');
  
  res.redirect(302, placeholderUrl);
});

module.exports = router;
