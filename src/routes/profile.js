/**
 * Profile Routes
 * Phase 3: Profile management routes
 */

const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  getProfile,
  updateProfile,
  searchProfiles
} = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMongoose');
const { requireMongoDB } = require('../middleware/mongoCheck');

// All Phase 3 routes require MongoDB
router.use(requireMongoDB);

/**
 * GET /api/v1/profile/me
 * Get authenticated user's profile (protected)
 */
router.get('/me', verifyToken, getMyProfile);

/**
 * GET /api/v1/profile/:userIdOrHandle
 * Get public profile by user ID or handle (public)
 */
router.get('/:userIdOrHandle', getProfile);

/**
 * PUT /api/v1/profile
 * Update authenticated user's profile (protected)
 */
router.put('/', verifyToken, updateProfile);

/**
 * GET /api/v1/profile/search?q=&page=&limit=
 * Search profiles (public)
 */
router.get('/search', searchProfiles);

module.exports = router;

