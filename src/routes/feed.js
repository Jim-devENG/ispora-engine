/**
 * Feed Routes
 * Phase 3: Personalized feed routes
 */

const express = require('express');
const router = express.Router();
const {
  getFeed,
  getFeedEntry
} = require('../controllers/feedController');
const { optionalVerifyToken } = require('../middleware/optionalAuthMongoose');
const { requireMongoDB } = require('../middleware/mongoCheck');

// All Phase 3 routes require MongoDB
router.use(requireMongoDB);

/**
 * GET /api/v1/feed?page=&limit=&type=all|personalized|following
 * Get feed items (public, optional auth for personalization)
 */
router.get('/', optionalVerifyToken, getFeed);

/**
 * GET /api/v1/feed/:id
 * Get single feed entry detail with comments and reactions (public)
 */
router.get('/:id', optionalVerifyToken, getFeedEntry);

module.exports = router;
