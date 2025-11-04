/**
 * Opportunity Engagement Model (Mongoose)
 * Phase 2.1: Tracks user engagement with opportunities (view/apply/bookmark/share)
 */

const mongoose = require('mongoose');

const opportunityEngagementSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: [true, 'Opportunity ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Engagement type is required'],
    enum: ['view', 'apply', 'bookmark', 'share'],
    index: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

// Indexes - compound index for unique user+opportunity+type for apply/bookmark
opportunityEngagementSchema.index({ opportunityId: 1, userId: 1, type: 1 }, {
  unique: true,
  partialFilterExpression: { type: { $in: ['apply', 'bookmark'] } }
});
opportunityEngagementSchema.index({ opportunityId: 1, type: 1, createdAt: -1 });
opportunityEngagementSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Virtual for opportunity (populate opportunityId)
opportunityEngagementSchema.virtual('opportunity', {
  ref: 'Opportunity',
  localField: 'opportunityId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user (populate userId)
opportunityEngagementSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included in JSON
opportunityEngagementSchema.set('toJSON', { virtuals: true });
opportunityEngagementSchema.set('toObject', { virtuals: true });

const OpportunityEngagement = mongoose.model('OpportunityEngagement', opportunityEngagementSchema);

module.exports = OpportunityEngagement;

