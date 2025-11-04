/**
 * Notification Model (Mongoose)
 * Phase 2: Notification schema for MongoDB
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'project_update',
      'task_assigned',
      'task_completed',
      'task_due_soon',
      'opportunity_posted',
      'mention',
      'comment',
      'system'
    ],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  // Reference to related resource (project, task, opportunity, etc.)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedType',
    index: true
  },
  relatedType: {
    type: String,
    enum: ['Project', 'Task', 'Opportunity', 'ProjectUpdate', null],
    default: null
  },
  // Metadata for additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
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
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Pre-save hook to set readAt when read is set to true
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  if (this.isModified('read') && !this.read && this.readAt) {
    this.readAt = undefined;
  }
  next();
});

// Virtual for user (populate userId)
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

