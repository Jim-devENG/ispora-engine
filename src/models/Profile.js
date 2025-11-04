/**
 * Profile Model (Mongoose)
 * Phase 3: User profile schema for social features
 */

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
    // Note: unique: true creates an index automatically
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name must be less than 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio must be less than 1000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location must be less than 200 characters']
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(skill => typeof skill === 'string' && skill.trim().length > 0);
      },
      message: 'Skills must be an array of non-empty strings'
    }
  },
  socials: {
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  coverUrl: {
    type: String,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  completed: {
    type: Boolean,
    default: false
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

// Indexes (userId index created automatically by unique: true)
profileSchema.index({ visibility: 1, createdAt: -1 });
profileSchema.index({ displayName: 'text', bio: 'text', title: 'text' }); // Text search

// Pre-save hook
profileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  // Mark as completed if essential fields are filled
  if (this.displayName && this.bio && this.title) {
    this.completed = true;
  }
  next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;

