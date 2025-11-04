/**
 * Phase 1.5: Seed Script
 * Seeds MongoDB with sample data for testing and development
 * Creates: 2 users, 3 projects, 5 tasks
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const Task = require('../models/Task');

// Sample seed data
const seedUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    userType: 'student'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    userType: 'professional'
  }
];

const seedProjects = [
  {
    title: 'Community Health Initiative',
    description: 'A project to improve healthcare access in rural communities',
    objectives: 'Objective 1: Establish mobile health clinics\nObjective 2: Train local healthcare workers\nObjective 3: Provide medical supplies',
    type: 'community',
    category: 'Healthcare',
    priority: 'high',
    visibility: 'public'
  },
  {
    title: 'Tech Education Program',
    description: 'Teaching coding skills to underserved youth',
    objectives: 'Objective 1: Develop curriculum\nObjective 2: Recruit mentors\nObjective 3: Launch program',
    type: 'academic',
    category: 'Education',
    priority: 'medium',
    visibility: 'public'
  },
  {
    title: 'Mentorship Network',
    description: 'Connecting diaspora professionals with students',
    objectives: 'Objective 1: Build mentor network, Objective 2: Match mentors with students, Objective 3: Track progress',
    type: 'mentorship',
    category: 'Education',
    priority: 'high',
    visibility: 'public'
  }
];

/**
 * Seed database with sample data
 */
const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - for development only)
    if (process.env.NODE_ENV === 'development' && process.env.CLEAR_SEED === 'true') {
      console.log('🗑️  Clearing existing data...');
      await User.deleteMany({});
      await Project.deleteMany({});
      await ProjectUpdate.deleteMany({});
      await Task.deleteMany({});
      console.log('✅ Existing data cleared');
    }

    // Create users
    console.log('👤 Creating users...');
    const users = [];
    for (const userData of seedUsers) {
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        // Hash password
        const passwordHash = await User.hashPassword(userData.password);
        
        // Create user (remove password field, use passwordHash instead)
        const { password, ...userDataWithoutPassword } = userData;
        user = new User({
          ...userDataWithoutPassword,
          passwordHash
        });
        
        await user.save();
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`ℹ️  User already exists: ${user.email}`);
      }
      
      users.push(user);
    }

    // Create projects
    console.log('📁 Creating projects...');
    const projects = [];
    for (let i = 0; i < seedProjects.length; i++) {
      const projectData = seedProjects[i];
      const owner = users[i % users.length]; // Alternate between users
      
      // Create project
      const project = new Project({
        ...projectData,
        owner: owner._id,
        objectives: projectData.objectives // Will be normalized by pre-save hook
      });
      
      await project.save();
      console.log(`✅ Created project: ${project.title}`);
      
      projects.push(project);

      // Create project update for each project
      const update = new ProjectUpdate({
        projectId: project._id,
        author: owner._id,
        content: `Project "${project.title}" has been created and is ready for contributors.`,
        type: 'update',
        title: 'Project Created'
      });
      
      await update.save();
      console.log(`✅ Created update for project: ${project.title}`);
    }

    // Create tasks
    console.log('✅ Creating tasks...');
    const taskTitles = [
      'Complete project documentation',
      'Recruit team members',
      'Set up communication channels',
      'Create project timeline',
      'Design project logo'
    ];

    for (let i = 0; i < taskTitles.length; i++) {
      const project = projects[i % projects.length];
      const assignee = i < 2 ? users[0] : users[1]; // Assign to different users
      
      const task = new Task({
        title: taskTitles[i],
        description: `Task for project: ${project.title}`,
        projectId: project._id,
        assignee: assignee._id,
        status: i === 0 ? 'done' : i === 1 ? 'doing' : 'todo',
        priority: i < 2 ? 'high' : 'medium',
        dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000) // Due in 1-5 weeks
      });
      
      await task.save();
      console.log(`✅ Created task: ${task.title}`);
    }

    // Summary
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const updateCount = await ProjectUpdate.countDocuments();
    const taskCount = await Task.countDocuments();

    console.log('\n📊 Seed Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Project Updates: ${updateCount}`);
    console.log(`   Tasks: ${taskCount}`);
    console.log('\n✅ Database seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    // Disconnect from MongoDB
    await disconnectDB();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = seed;

