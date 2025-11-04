/**
 * Task Model (Mongoose)
 * Phase 1: Task schema for MongoDB
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description must be less than 2000 characters']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  status: {
    type: String,
    enum: ['todo', 'doing', 'done'],
    default: 'todo',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
    // Index created via schema.index() below, don't use index: true here
  },
  tags: {
    type: [String],
    default: []
  },
  completedDate: {
    type: Date
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
taskSchema.index({ projectId: 1, createdAt: -1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ dueDate: 1 }); // Explicit index (no index: true in field definition)

// Pre-save hook to update updatedAt and set completedDate
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If status changed to 'done', set completedDate
  if (this.isModified('status') && this.status === 'done' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  // If status changed from 'done' to something else, clear completedDate
  if (this.isModified('status') && this.status !== 'done' && this.completedDate) {
    this.completedDate = undefined;
  }
  
  next();
});

// Virtual for project (populate projectId)
taskSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignee (populate assignee)
taskSchema.virtual('assigneeUser', {
  ref: 'User',
  localField: 'assignee',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are included in JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

