/**
 * Follow Routes
 * Phase 3: Follow graph management routes
 */

const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/followController');
const { verifyToken } = require('../middleware/authMongoose');
const { requireMongoDB } = require('../middleware/mongoCheck');

// All Phase 3 routes require MongoDB
router.use(requireMongoDB);

/**
 * POST /api/v1/follow
 * Follow a user (protected)
 */
router.post('/', verifyToken, followUser);

/**
 * DELETE /api/v1/follow/:followeeId
 * Unfollow a user (protected)
 */
router.delete('/:followeeId', verifyToken, unfollowUser);

/**
 * GET /api/v1/follow/:userId/followers?page&limit
 * Get followers of a user (public)
 */
router.get('/:userId/followers', getFollowers);

/**
 * GET /api/v1/follow/:userId/following?page&limit
 * Get users that a user is following (public)
 */
router.get('/:userId/following', getFollowing);

module.exports = router;

