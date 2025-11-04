/**
 * Opportunity Model (Mongoose)
 * Phase 2: Opportunity schema for MongoDB
 * Admin-controlled opportunities (jobs, scholarships, events, etc.)
 */

const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description must be less than 5000 characters']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['job', 'scholarship', 'internship', 'event', 'workshop', 'grant', 'other'],
    index: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized',
    index: true
  },
  organization: {
    type: String,
    trim: true,
    maxlength: [200, 'Organization name must be less than 200 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location must be less than 200 characters']
  },
  // Remote, hybrid, or on-site
  workMode: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite', null],
    default: null
  },
  // Salary, amount, or stipend (if applicable)
  compensation: {
    type: String,
    trim: true,
    maxlength: [200, 'Compensation must be less than 200 characters']
  },
  // Application deadline
  deadline: {
    type: Date,
    index: true
  },
  // Application link
  applicationLink: {
    type: String,
    trim: true,
    maxlength: [500, 'Application link must be less than 500 characters']
  },
  // Contact email
  contactEmail: {
    type: String,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  // Tags for filtering
  tags: {
    type: [String],
    default: []
  },
  // Admin who created this opportunity
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required'],
    index: true
  },
  // Status: active, expired, closed
  status: {
    type: String,
    enum: ['active', 'expired', 'closed'],
    default: 'active',
    index: true
  },
  // Visibility: public, private (for future use)
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  // Featured opportunity (shown prominently)
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  // View count
  views: {
    type: Number,
    default: 0
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

// Indexes
opportunitySchema.index({ type: 1, status: 1, createdAt: -1 });
opportunitySchema.index({ category: 1, status: 1, createdAt: -1 });
opportunitySchema.index({ featured: 1, status: 1, createdAt: -1 });
opportunitySchema.index({ deadline: 1, status: 1 });
opportunitySchema.index({ tags: 1 });

// Pre-save hook to update updatedAt and check expiration
opportunitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-expire opportunities past their deadline
  if (this.deadline && this.deadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

// Virtual for creator (populate createdBy)
opportunitySchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Instance method to increment views
opportunitySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Ensure virtual fields are included in JSON
opportunitySchema.set('toJSON', { virtuals: true });
opportunitySchema.set('toObject', { virtuals: true });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

module.exports = Opportunity;

