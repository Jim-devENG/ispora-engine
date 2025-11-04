/**
 * Opportunity Metrics Model (Mongoose)
 * Phase 2.1: Tracks aggregated metrics for opportunities (views, applies, bookmarks, shares)
 */

const mongoose = require('mongoose');

const opportunityMetricsSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: [true, 'Opportunity ID is required'],
    unique: true
    // Note: unique: true creates an index automatically
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  applies: {
    type: Number,
    default: 0,
    min: 0
  },
  bookmarks: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // We manage lastUpdated manually
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

// Indexes (opportunityId index created automatically by unique: true)
opportunityMetricsSchema.index({ applies: -1, views: -1 }); // For trending queries
opportunityMetricsSchema.index({ lastUpdated: -1 });

// Static method to get or create metrics document
opportunityMetricsSchema.statics.getOrCreate = async function(opportunityId) {
  let metrics = await this.findOne({ opportunityId });
  
  if (!metrics) {
    metrics = new this({
      opportunityId,
      views: 0,
      applies: 0,
      bookmarks: 0,
      shares: 0,
      lastUpdated: new Date()
    });
    await metrics.save();
  }
  
  return metrics;
};

// Static method to increment metrics atomically
opportunityMetricsSchema.statics.incrementMetric = async function(opportunityId, type) {
  const validTypes = ['views', 'applies', 'bookmarks', 'shares'];
  
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid metric type: ${type}. Must be one of: ${validTypes.join(', ')}`);
  }

  // Use findOneAndUpdate with $inc for atomic update
  const result = await this.findOneAndUpdate(
    { opportunityId },
    {
      $inc: { [type]: 1 },
      $set: { lastUpdated: new Date() }
    },
    {
      upsert: true, // Create if doesn't exist
      new: true, // Return updated document
      setDefaultsOnInsert: true
    }
  );

  return result;
};

// Static method to decrement metrics atomically (for bookmark removal, etc.)
opportunityMetricsSchema.statics.decrementMetric = async function(opportunityId, type) {
  const validTypes = ['bookmarks']; // Only allow decrement for bookmarks (removable)
  
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid metric type for decrement: ${type}. Only bookmarks can be decremented.`);
  }

  const result = await this.findOneAndUpdate(
    { opportunityId },
    {
      $inc: { [type]: -1 },
      $set: { lastUpdated: new Date() }
    },
    {
      new: true
    }
  );

  return result;
};

const OpportunityMetrics = mongoose.model('OpportunityMetrics', opportunityMetricsSchema);

module.exports = OpportunityMetrics;

