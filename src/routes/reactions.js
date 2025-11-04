/**
 * Reactions Routes
 * Phase 3: Reaction management routes
 */

const express = require('express');
const router = express.Router();
const {
  addReaction,
  removeReaction,
  getReactions
} = require('../controllers/reactionController');
const { verifyToken } = require('../middleware/authMongoose');
const { optionalVerifyToken } = require('../middleware/optionalAuthMongoose');
const { requireMongoDB } = require('../middleware/mongoCheck');

// All Phase 3 routes require MongoDB
router.use(requireMongoDB);

/**
 * POST /api/v1/reactions
 * Add or update a reaction (protected)
 */
router.post('/', verifyToken, addReaction);

/**
 * DELETE /api/v1/reactions
 * Remove a reaction (protected)
 */
router.delete('/', verifyToken, removeReaction);

/**
 * GET /api/v1/reactions?targetType=&targetId=
 * Get reactions for a target (public)
 */
router.get('/', optionalVerifyToken, getReactions);

module.exports = router;

