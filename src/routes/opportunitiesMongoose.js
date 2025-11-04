/**
 * Opportunities Routes (Mongoose)
 * Phase 2: Opportunities endpoints (Admin only)
 */

const express = require('express');
const router = express.Router();
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunitiesMongoose');
const {
  recordEngagement,
  getMetrics,
  removeBookmark
} = require('../controllers/opportunityEngagementMongoose');
const { verifyToken } = require('../middleware/authMongoose');
const { optionalVerifyToken } = require('../middleware/optionalAuthMongoose');
const { requireAdmin } = require('../middleware/adminMongoose');

// Public routes (anyone can view opportunities)
router.get('/', getOpportunities);

// Phase 2.1: Get opportunity by ID - optional auth for view tracking
router.get('/:id', optionalVerifyToken, getOpportunity);

// Phase 2.1: Opportunity Engagement (public - optional auth)
router.post('/:id/engagement', optionalVerifyToken, recordEngagement); // Optional auth for anonymous views
router.get('/:id/metrics', getMetrics); // Public

// Bookmark removal (requires auth)
router.delete('/:id/bookmark', verifyToken, removeBookmark);

// Admin-only routes (require authentication + admin role)
router.post('/', verifyToken, requireAdmin, createOpportunity);
router.put('/:id', verifyToken, requireAdmin, updateOpportunity);
router.delete('/:id', verifyToken, requireAdmin, deleteOpportunity);

module.exports = router;

