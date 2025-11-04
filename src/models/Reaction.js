/**
 * Reaction Model (Mongoose)
 * Phase 3: Reactions (like, love, celebrate, insightful, support) on content
 */

const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  targetType: {
    type: String,
    enum: ['project', 'update', 'post', 'comment', 'task'],
    required: [true, 'Target type is required'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    index: true
  },
  reactionType: {
    type: String,
    enum: ['like', 'love', 'celebrate', 'insightful', 'support'],
    required: [true, 'Reaction type is required'],
    default: 'like'
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

// Unique compound index: a user can only have one reaction per target (can update reactionType)
reactionSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for aggregation queries
reactionSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction;

