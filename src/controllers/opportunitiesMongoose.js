/**
 * Opportunities Controller (Mongoose)
 * Phase 2: Opportunities CRUD (Admin only)
 */

const Opportunity = require('../models/Opportunity');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Create a new opportunity
 * Admin only
 */
const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category = 'Uncategorized',
      organization,
      location,
      workMode,
      compensation,
      deadline,
      applicationLink,
      contactEmail,
      tags = [],
      featured = false,
      status = 'active',
      visibility = 'public'
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Title is required'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Description is required'
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: 'Type is required'
      });
    }

    // Get admin user from authenticated request
    const createdBy = req.user._id;

    // Create opportunity
    const opportunity = new Opportunity({
      title: title.trim(),
      description: description.trim(),
      type,
      category: category || 'Uncategorized',
      organization: organization ? organization.trim() : undefined,
      location: location ? location.trim() : undefined,
      workMode,
      compensation: compensation ? compensation.trim() : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      applicationLink: applicationLink ? applicationLink.trim() : undefined,
      contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : undefined,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      status,
      visibility,
      createdBy
    });

    await opportunity.save();

    // Populate creator for response
    await opportunity.populate('createdBy', 'name email firstName lastName');

    logger.info({
      opportunityId: opportunity._id.toString(),
      createdBy: createdBy.toString(),
      title: opportunity.title,
      type: opportunity.type
    }, '✅ Opportunity created successfully');

    // Phase 2.1: Create notification for all users (for featured opportunities)
    // Respects user preferences - only sends realtime to users with opportunity notifications enabled
    if (opportunity.featured && opportunity.status === 'active' && opportunity.visibility === 'public') {
      try {
        const User = require('../models/User');
        const users = await User.find({}).select('_id').lean();
        const userIds = users.map(u => u._id);

        if (userIds.length > 0) {
          const result = await notificationService.createBulkNotifications(userIds, {
            type: 'opportunity_posted',
            title: `New opportunity: ${opportunity.title}`,
            message: `Check out this new ${opportunity.type} opportunity: ${opportunity.title}`,
            relatedId: opportunity._id,
            relatedType: 'Opportunity',
            metadata: {
              opportunityId: opportunity._id.toString(),
              type: opportunity.type,
              organization: opportunity.organization
            }
          });
          
          // Log how many users will receive realtime notifications
          logger.info({
            totalUsers: userIds.length,
            realtimeAllowed: result.allowedForRealtime?.length || 0,
            opportunityId: opportunity._id.toString()
          }, 'Featured opportunity notifications created with preference filtering');
        }
      } catch (notifError) {
        // Log error but don't fail opportunity creation
        logger.error({ 
          error: notifError.message, 
          opportunityId: opportunity._id.toString() 
        }, 'Failed to create notifications for featured opportunity');
      }
    }

    // Format response
    const responseOpportunity = opportunity.toJSON();
    if (responseOpportunity.creator) {
      responseOpportunity.creator = {
        id: opportunity.createdBy._id.toString(),
        email: opportunity.createdBy.email || null,
        name: opportunity.createdBy.name || opportunity.createdBy.email || 'Unknown',
        first_name: opportunity.createdBy.firstName || null,
        last_name: opportunity.createdBy.lastName || null
      };
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: responseOpportunity
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, '❌ Opportunity creation failed');

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: messages
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        code: 'INVALID_ID',
        message: 'The provided ID is invalid'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to create opportunity. Please try again later.'
    });
  }
};

/**
 * Get all opportunities (public)
 * Supports pagination and filtering
 */
const getOpportunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, category, status, featured, search } = req.query;

    // Build query - only active, public opportunities by default
    const query = { status: 'active', visibility: 'public' };

    // Apply filters
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (featured === 'true') {
      query.featured = true;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    // Admin can see all opportunities (including non-active)
    if (req.user && (req.user.roles?.includes('admin') || req.user.userType === 'admin')) {
      if (status) {
        query.status = status;
      } else {
        delete query.status; // Remove default status filter for admin
      }
      delete query.visibility; // Admin can see private opportunities too
    }

    // Get opportunities with pagination
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate('createdBy', 'name email firstName lastName')
        .sort({ featured: -1, createdAt: -1 }) // Featured first, then newest
        .skip(skip)
        .limit(limit)
        .lean(),
      Opportunity.countDocuments(query)
    ]);

    logger.info({
      total,
      page,
      limit,
      filters: { type, category, featured, search }
    }, '✅ Opportunities retrieved successfully');

    res.status(200).json({
      success: true,
      data: opportunities,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error({ error: error.message }, '❌ Failed to get opportunities');

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve opportunities. Please try again later.'
    });
  }
};

/**
 * Get single opportunity by ID
 */
const getOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    // Build query
    let query = { _id: opportunityId };

    // Non-admin users can only see active, public opportunities
    if (!req.user || (!req.user.roles?.includes('admin') && req.user.userType !== 'admin')) {
      query.status = 'active';
      query.visibility = 'public';
    }

    const opportunity = await Opportunity.findOne(query)
      .populate('createdBy', 'name email firstName lastName')
      .lean();

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    // Phase 2.1: Record view engagement (async, don't wait)
    // Anonymous views are tracked via OpportunityEngagementService
    const opportunityEngagementService = require('../services/opportunityEngagementService');
    const userId = req.user ? req.user._id : null; // Optional user from optionalVerifyToken
    
    opportunityEngagementService.recordEngagement(
      opportunityId,
      userId, // null for anonymous
      'view',
      {}
    ).catch(err => {
      logger.error({ error: err.message }, 'Failed to record opportunity view');
    });

    res.status(200).json({
      success: true,
      data: opportunity
    });

  } catch (error) {
    logger.error({ error: error.message, opportunityId: req.params.id }, '❌ Failed to get opportunity');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID',
        code: 'INVALID_ID',
        message: 'The provided opportunity ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve opportunity. Please try again later.'
    });
  }
};

/**
 * Update opportunity
 * Admin only
 */
const updateOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const updateData = req.body;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'type', 'category', 'organization', 'location',
      'workMode', 'compensation', 'deadline', 'applicationLink', 'contactEmail',
      'tags', 'featured', 'status', 'visibility'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'deadline' && updateData[field]) {
          opportunity[field] = new Date(updateData[field]);
        } else if (field === 'contactEmail' && updateData[field]) {
          opportunity[field] = updateData[field].trim().toLowerCase();
        } else if (typeof updateData[field] === 'string') {
          opportunity[field] = updateData[field].trim();
        } else {
          opportunity[field] = updateData[field];
        }
      }
    });

    await opportunity.save();

    // Populate creator for response
    await opportunity.populate('createdBy', 'name email firstName lastName');

    logger.info({
      opportunityId: opportunity._id.toString(),
      updatedBy: req.user._id.toString()
    }, '✅ Opportunity updated successfully');

    // Format response
    const responseOpportunity = opportunity.toJSON();
    if (responseOpportunity.creator) {
      responseOpportunity.creator = {
        id: opportunity.createdBy._id.toString(),
        email: opportunity.createdBy.email || null,
        name: opportunity.createdBy.name || opportunity.createdBy.email || 'Unknown',
        first_name: opportunity.createdBy.firstName || null,
        last_name: opportunity.createdBy.lastName || null
      };
    }

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      data: responseOpportunity
    });

  } catch (error) {
    logger.error({ error: error.message, opportunityId: req.params.id }, '❌ Failed to update opportunity');

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        code: 'INVALID_PAYLOAD',
        message: messages
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID',
        code: 'INVALID_ID',
        message: 'The provided opportunity ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to update opportunity. Please try again later.'
    });
  }
};

/**
 * Delete opportunity
 * Admin only
 */
const deleteOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        code: 'NOT_FOUND',
        message: 'The requested opportunity could not be found'
      });
    }

    await Opportunity.deleteOne({ _id: opportunityId });

    logger.info({
      opportunityId,
      deletedBy: req.user._id.toString()
    }, '✅ Opportunity deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully'
    });

  } catch (error) {
    logger.error({ error: error.message, opportunityId: req.params.id }, '❌ Failed to delete opportunity');

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID',
        code: 'INVALID_ID',
        message: 'The provided opportunity ID is invalid'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      message: 'Failed to delete opportunity. Please try again later.'
    });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity
};

