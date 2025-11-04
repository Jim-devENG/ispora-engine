/**
 * Admin Insights Routes (Mongoose)
 * Phase 2.1: Admin insights and analytics endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getTrendingOpportunities,
  getOpportunityAnalytics
} = require('../controllers/adminInsightsMongoose');
const { verifyToken } = require('../middleware/authMongoose');
const { requireAdmin } = require('../middleware/adminMongoose');

// All admin insights routes require authentication + admin role
router.use(verifyToken);
router.use(requireAdmin);

/**
 * GET /api/v1/admin/opportunities/trending
 * Get trending opportunities (admin only)
 * Query params: limit (default 10), days (default 7)
 */
router.get('/opportunities/trending', getTrendingOpportunities);

/**
 * GET /api/v1/admin/opportunities/:id/analytics
 * Get detailed analytics for an opportunity (admin only)
 */
router.get('/opportunities/:id/analytics', getOpportunityAnalytics);

module.exports = router;

