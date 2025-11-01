const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/placeholder/:width/:height - Generate placeholder image
router.get('/:width/:height', (req, res) => {
  try {
    const { width, height } = req.params;
    const { redirect } = req.query;
    
    // Validate dimensions
    const w = parseInt(width);
    const h = parseInt(height);
    
    if (isNaN(w) || isNaN(h) || w < 1 || h < 1 || w > 2000 || h > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dimensions. Width and height must be numbers between 1 and 2000'
      });
    }
    
    // If redirect=true, redirect to via.placeholder.com
    if (redirect === 'true') {
      const placeholderUrl = `https://via.placeholder.com/${w}x${h}`;
      logger.info({ width: w, height: h, url: placeholderUrl }, 'Redirecting to via.placeholder.com');
      return res.redirect(placeholderUrl);
    }
    
    // Generate SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="100%" height="100%" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
          ${w} × ${h}
        </text>
      </svg>
    `.trim();
    
    logger.info({ width: w, height: h }, 'Generated placeholder image');
    
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(svg);
  } catch (error) {
    logger.error({ error: error.message }, 'Error generating placeholder');
    res.status(500).json({
      success: false,
      error: 'Failed to generate placeholder image'
    });
  }
});

// GET /api/placeholder/:size - Generate square placeholder
router.get('/:size', (req, res) => {
  try {
    const { size } = req.params;
    const s = parseInt(size);
    
    if (isNaN(s) || s < 1 || s > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid size. Size must be a number between 1 and 2000'
      });
    }
    
    // Generate square SVG placeholder
    const svg = `
      <svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="100%" height="100%" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
          ${s} × ${s}
        </text>
      </svg>
    `.trim();
    
    logger.info({ size: s }, 'Generated square placeholder image');
    
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.send(svg);
  } catch (error) {
    logger.error({ error: error.message }, 'Error generating square placeholder');
    res.status(500).json({
      success: false,
      error: 'Failed to generate placeholder image'
    });
  }
});

module.exports = router;
