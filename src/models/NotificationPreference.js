/**
 * Notification Preference Model (Mongoose)
 * Phase 2.1: User notification preferences and settings
 */

const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
    // Note: unique: true creates an index automatically
  },
  preferences: {
    categories: {
      project: {
        type: Boolean,
        default: true
      },
      task: {
        type: Boolean,
        default: true
      },
      opportunity: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      }
    },
    delivery: {
      realtime: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: false
      }
    },
    mutedUntil: {
      type: Date,
      default: null
      // Index created via schema.index() below
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
  timestamps: false, // We manage createdAt/updatedAt manually
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

// Indexes (userId index created automatically by unique: true)
notificationPreferenceSchema.index({ 'preferences.mutedUntil': 1 });

// Pre-save hook to update updatedAt
notificationPreferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for user (populate userId)
notificationPreferenceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included in JSON
notificationPreferenceSchema.set('toJSON', { virtuals: true });
notificationPreferenceSchema.set('toObject', { virtuals: true });

// Static method to get or create default preferences
notificationPreferenceSchema.statics.getOrCreateDefault = async function(userId) {
  let preference = await this.findOne({ userId });
  
  if (!preference) {
    preference = new this({
      userId,
      preferences: {
        categories: {
          project: true,
          task: true,
          opportunity: true,
          system: true
        },
        delivery: {
          realtime: true,
          email: false
        },
        mutedUntil: null
      }
    });
    await preference.save();
  }
  
  return preference;
};

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

module.exports = NotificationPreference;

