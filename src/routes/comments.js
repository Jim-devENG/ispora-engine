/**
 * Comments Routes
 * Phase 3: Comment management routes
 */

const express = require('express');
const router = express.Router();
const {
  createComment,
  listComments,
  updateComment
} = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMongoose');
const { optionalVerifyToken } = require('../middleware/optionalAuthMongoose');
const { requireMongoDB } = require('../middleware/mongoCheck');

// All Phase 3 routes require MongoDB
router.use(requireMongoDB);

/**
 * POST /api/v1/comments
 * Create a comment (protected)
 */
router.post('/', verifyToken, createComment);

/**
 * GET /api/v1/comments?parentType=&parentId=&page=&limit=
 * List comments for a parent (public)
 */
router.get('/', optionalVerifyToken, listComments);

/**
 * PATCH /api/v1/comments/:id
 * Update or soft delete a comment (protected, author or admin only)
 */
router.patch('/:id', verifyToken, updateComment);

module.exports = router;

