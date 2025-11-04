/**
 * Comment Model (Mongoose)
 * Phase 3: Comments on projects, updates, posts, tasks
 */

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID is required'],
    index: true
  },
  parentType: {
    type: String,
    enum: ['project', 'update', 'post', 'task'],
    required: [true, 'Parent type is required'],
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Parent ID is required'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [1, 'Content must be at least 1 character'],
    maxlength: [5000, 'Content must be less than 5000 characters']
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
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

// Compound index for efficient querying by parent
commentSchema.index({ parentType: 1, parentId: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ deleted: 1, createdAt: -1 });

// Pre-save hook
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Post-save hook to create notification for parent owner (Phase 3)
commentSchema.post('save', async function(doc) {
  try {
    const notificationService = require('../services/notificationService');
    const Project = require('./Project');
    const ProjectUpdate = require('./ProjectUpdate');
    const Task = require('./Task');
    const User = require('./User');
    const logger = require('../utils/logger');

    // Get comment author
    const author = await User.findById(doc.author);
    if (!author) {
      return;
    }

    const authorName = author.name || author.email || 'Someone';

    // Determine parent owner based on parentType
    let parentOwner = null;
    let parentTitle = null;

    switch (doc.parentType) {
      case 'project':
        const project = await Project.findById(doc.parentId);
        if (project && project.owner.toString() !== doc.author.toString()) {
          parentOwner = project.owner;
          parentTitle = project.title;
        }
        break;

      case 'update':
        const update = await ProjectUpdate.findById(doc.parentId).populate('projectId');
        if (update && update.author.toString() !== doc.author.toString()) {
          parentOwner = update.author;
          parentTitle = update.title || update.projectId?.title;
        }
        break;

      case 'task':
        const task = await Task.findById(doc.parentId).populate('projectId');
        if (task && task.assignee && task.assignee.toString() !== doc.author.toString()) {
          parentOwner = task.assignee;
          parentTitle = task.title;
        } else if (task && task.projectId && task.projectId.owner.toString() !== doc.author.toString()) {
          parentOwner = task.projectId.owner;
          parentTitle = task.title;
        }
        break;
    }

    // Create notification for parent owner (respects preferences)
    if (parentOwner) {
      await notificationService.createNotification({
        userId: parentOwner,
        type: 'mention', // Using 'mention' for comments on user's content
        title: `New comment on ${parentTitle || 'your content'}`,
        message: `${authorName} commented: ${doc.content.substring(0, 100)}${doc.content.length > 100 ? '...' : ''}`,
        relatedId: doc._id.toString(),
        relatedType: 'Comment',
        metadata: {
          commentId: doc._id.toString(),
          parentType: doc.parentType,
          parentId: doc.parentId.toString(),
          parentTitle
        }
      });

      logger.debug({
        commentId: doc._id.toString(),
        parentType: doc.parentType,
        parentId: doc.parentId.toString()
      }, 'Comment notification created');
    }
  } catch (error) {
    // Log error but don't throw - notification failure shouldn't break comment creation
    const logger = require('../utils/logger');
    logger.error({
      error: error.message,
      commentId: doc._id?.toString()
    }, 'Failed to create notification for comment');
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

