/**
 * FeedPreference Model (Mongoose)
 * Phase 3: User feed personalization preferences
 */

const mongoose = require('mongoose');

const feedPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
    // Note: unique: true creates an index automatically
  },
  sources: {
    projects: {
      type: Boolean,
      default: true
    },
    people: {
      type: Boolean,
      default: true
    },
    opportunities: {
      type: Boolean,
      default: true
    }
  },
  sort: {
    type: String,
    enum: ['recent', 'personalized'],
    default: 'recent'
  },
  topics: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(topic => typeof topic === 'string' && topic.trim().length > 0);
      },
      message: 'Topics must be an array of non-empty strings'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
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

// Pre-save hook
feedPreferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const FeedPreference = mongoose.model('FeedPreference', feedPreferenceSchema);

module.exports = FeedPreference;

