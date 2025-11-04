/**
 * Project Model (Mongoose)
 * Phase 1: Project schema for MongoDB with objectives normalization
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description must be less than 5000 characters']
  },
  // 🔑 CRITICAL: objectives stored as array (canonical format)
  // Frontend sends string, but we normalize to array on save
  objectives: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // Ensure all items are non-empty strings
        return v.every(item => typeof item === 'string' && item.trim().length > 0);
      },
      message: 'Objectives must be an array of non-empty strings'
    }
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  type: {
    type: String,
    enum: ['mentorship', 'academic', 'career', 'community', 'collaboration'],
    default: 'academic'
  },
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized'
  },
  tags: {
    type: [String],
    default: []
  },
  teamMembers: {
    type: [{
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
      avatar: { type: String }
    }],
    default: []
  },
  diasporaPositions: {
    type: [{
      title: { type: String, required: true },
      description: { type: String },
      responsibilities: { type: [String], default: [] },
      requirements: { type: [String], default: [] },
      commitment: { type: String },
      category: {
        type: String,
        enum: ['leadership', 'technical', 'advisory', 'mentorship', 'support']
      },
      isActive: { type: Boolean, default: true }
    }],
    default: []
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  university: {
    type: String,
    trim: true
  },
  mentorshipConnection: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'draft'],
    default: 'active'
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
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ visibility: 1, isPublic: 1, createdAt: -1 });
projectSchema.index({ type: 1, category: 1 });

/**
 * 🔑 CRITICAL: Pre-save hook to normalize objectives
 * Frontend sends objectives as string, but we store as array
 * This ensures objectives is ALWAYS an array before saving
 */
projectSchema.pre('save', function(next) {
  // If objectives is provided but not an array, normalize it
  if (this.isModified('objectives') || this.isNew) {
    if (!Array.isArray(this.objectives)) {
      // If it's a string, split by newline or comma
      if (typeof this.objectives === 'string') {
        const normalized = this.objectives
          .split(/\n|,/) // Split by newline or comma
          .map(obj => obj.trim()) // Trim whitespace
          .filter(obj => obj.length > 0); // Remove empty strings
        
        this.objectives = normalized;
      } else if (this.objectives == null) {
        // If null or undefined, set to empty array
        this.objectives = [];
      } else {
        // If it's something else, try to convert to array
        this.objectives = [String(this.objectives)].filter(obj => obj.trim().length > 0);
      }
    } else {
      // If it's already an array, ensure all items are strings and non-empty
      this.objectives = this.objectives
        .map(obj => typeof obj === 'string' ? obj.trim() : String(obj).trim())
        .filter(obj => obj.length > 0);
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Virtual for creator (populate owner)
projectSchema.virtual('creator', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

