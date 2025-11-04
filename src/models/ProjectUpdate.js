/**
 * ProjectUpdate Model (Mongoose)
 * Phase 1: Project updates schema for MongoDB
 */

const mongoose = require('mongoose');

const projectUpdateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Update content is required'],
    trim: true,
    maxlength: [5000, 'Content must be less than 5000 characters']
  },
  type: {
    type: String,
    enum: ['milestone', 'update', 'announcement', 'progress', 'general'],
    default: 'update'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // We only use createdAt
  toJSON: {
    transform: function(doc, ret) {
      // Transform _id to id
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
projectUpdateSchema.index({ projectId: 1, createdAt: -1 });
projectUpdateSchema.index({ author: 1, createdAt: -1 });

// Virtual for project (populate projectId)
projectUpdateSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included in JSON
projectUpdateSchema.set('toJSON', { virtuals: true });
projectUpdateSchema.set('toObject', { virtuals: true });

// Phase 2: Post-save hook to create notifications for project team members
projectUpdateSchema.post('save', async function(doc) {
  try {
    const Project = mongoose.model('Project');
    const notificationService = require('../services/notificationService');
    const logger = require('../utils/logger');

    // Get project and its owner/team members
    const project = await Project.findById(doc.projectId)
      .populate('owner')
      .populate('teamMembers');

    if (!project) {
      return; // Project not found, skip notification
    }

    // Get author info
    const author = await mongoose.model('User').findById(doc.author);
    const authorName = author?.name || author?.email || 'Someone';

    // Notify project owner (if update author is not the owner)
    const userIdsToNotify = [];
    
    if (project.owner && project.owner._id.toString() !== doc.author.toString()) {
      userIdsToNotify.push(project.owner._id);
    }

    // Notify team members (if any)
    if (project.teamMembers && Array.isArray(project.teamMembers)) {
      project.teamMembers.forEach(member => {
        if (member._id && member._id.toString() !== doc.author.toString()) {
          userIdsToNotify.push(member._id);
        }
      });
    }

    // Phase 2.1: Create notifications for all recipients (respects preferences)
    if (userIdsToNotify.length > 0) {
      const result = await notificationService.createBulkNotifications(userIdsToNotify, {
        type: 'project_update',
        title: `New update on ${project.title}`,
        message: `${authorName} posted an update: ${doc.title || 'Update'}`,
        relatedId: doc.projectId,
        relatedType: 'Project',
        metadata: {
          updateId: doc._id.toString(),
          projectTitle: project.title,
          updateTitle: doc.title,
          updateType: doc.type
        }
      });
      
      // Log how many users will receive realtime notifications
      logger.debug({
        totalRecipients: userIdsToNotify.length,
        realtimeAllowed: result.allowedForRealtime?.length || 0,
        projectId: doc.projectId.toString()
      }, 'Project update notifications created with preference filtering');
    }
  } catch (error) {
    // Log error but don't throw - notification failure shouldn't break update creation
    const logger = require('../utils/logger');
    logger.error({ 
      error: error.message, 
      projectUpdateId: doc._id?.toString() 
    }, 'Failed to create notifications for project update');
  }
});

const ProjectUpdate = mongoose.model('ProjectUpdate', projectUpdateSchema);

module.exports = ProjectUpdate;

