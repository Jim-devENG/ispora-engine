/**
 * Phase 1.5: Integration Tests
 * Full request-response cycle tests
 * Login → create project → fetch updates → create task → fetch tasks
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const Task = require('../models/Task');

// Test database connection
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for integration tests. Tests may fail.');
      console.warn('   Set MONGO_TEST_URI environment variable or start MongoDB locally.');
      throw error;
    }
  }
});

afterAll(async () => {
  // Clean up test database
  await Task.deleteMany({});
  await ProjectUpdate.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 1.5: Integration Tests - Full Request-Response Cycle', () => {
  let testUser;
  let authToken;
  let createdProject;
  let createdTask;

  beforeEach(async () => {
    // Clean up before each test
    await Task.deleteMany({});
    await ProjectUpdate.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: await User.hashPassword('password123'),
      firstName: 'Test',
      lastName: 'User',
      userType: 'student'
    });
    await testUser.save();
  });

  describe('Full Integration Flow', () => {
    test('Login → Create Project → Fetch Updates → Create Task → Fetch Tasks', async () => {
      // Step 1: Login
      console.log('🔐 Step 1: Login...');
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.data.user).toBeDefined();
      expect(loginResponse.body.data.user.email).toBe('test@example.com');
      
      authToken = loginResponse.body.token;
      console.log('✅ Login successful');

      // Step 2: Create Project
      console.log('📁 Step 2: Create Project...');
      const projectResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Integration Test Project',
          description: 'Test project for integration testing',
          objectives: 'Objective 1\nObjective 2\nObjective 3',
          type: 'academic',
          category: 'Education',
          priority: 'high'
        })
        .expect(201);

      expect(projectResponse.body.success).toBe(true);
      expect(projectResponse.body.data).toBeDefined();
      expect(projectResponse.body.data.title).toBe('Integration Test Project');
      
      // 🔑 CRITICAL: Verify objectives is stored as array (normalized)
      expect(Array.isArray(projectResponse.body.data.objectives)).toBe(true);
      expect(projectResponse.body.data.objectives.length).toBe(3);
      expect(projectResponse.body.data.objectives).toEqual([
        'Objective 1',
        'Objective 2',
        'Objective 3'
      ]);

      expect(projectResponse.body.data.creator).toBeDefined();
      expect(projectResponse.body.data.creator.email).toBe('test@example.com');
      
      createdProject = projectResponse.body.data;
      console.log('✅ Project created successfully');

      // Step 3: Fetch Project Updates
      console.log('📰 Step 3: Fetch Project Updates...');
      const updatesResponse = await request(app)
        .get('/api/v1/projects/updates?mine=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(updatesResponse.body.success).toBe(true);
      expect(updatesResponse.body.data).toBeDefined();
      expect(Array.isArray(updatesResponse.body.data)).toBe(true);
      
      // Verify update structure
      if (updatesResponse.body.data.length > 0) {
        const update = updatesResponse.body.data[0];
        expect(update).toHaveProperty('id');
        expect(update).toHaveProperty('projectId');
        expect(update).toHaveProperty('content');
        expect(update).toHaveProperty('timestamp');
        
        // Verify project reference
        if (update.project) {
          expect(update.project.id).toBe(createdProject.id);
        }
      }
      
      console.log('✅ Project updates fetched successfully');

      // Step 4: Create Task
      console.log('✅ Step 4: Create Task...');
      const taskResponse = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Integration Test Task',
          description: 'Test task for integration testing',
          projectId: createdProject.id,
          status: 'todo',
          priority: 'high'
        })
        .expect(201);

      expect(taskResponse.body.success).toBe(true);
      expect(taskResponse.body.data).toBeDefined();
      expect(taskResponse.body.data.title).toBe('Integration Test Task');
      expect(taskResponse.body.data.projectId).toBe(createdProject.id);
      expect(taskResponse.body.data.status).toBe('todo');
      expect(taskResponse.body.data.priority).toBe('high');
      
      createdTask = taskResponse.body.data;
      console.log('✅ Task created successfully');

      // Step 5: Fetch Tasks for Project
      console.log('📋 Step 5: Fetch Tasks for Project...');
      const tasksResponse = await request(app)
        .get(`/api/v1/tasks/project/${createdProject.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(tasksResponse.body.success).toBe(true);
      expect(tasksResponse.body.data).toBeDefined();
      expect(Array.isArray(tasksResponse.body.data)).toBe(true);
      
      // Verify task structure
      if (tasksResponse.body.data.length > 0) {
        const task = tasksResponse.body.data.find(t => t.id === createdTask.id);
        expect(task).toBeDefined();
        expect(task.title).toBe('Integration Test Task');
        expect(task.projectId).toBe(createdProject.id);
      }
      
      console.log('✅ Tasks fetched successfully');

      // Step 6: Verify Health Endpoint
      console.log('🏥 Step 6: Verify Health Endpoint...');
      const healthResponse = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(healthResponse.body.success).toBe(true);
      expect(healthResponse.body.status).toBe('ok');
      expect(healthResponse.body.timestamp).toBeDefined();
      expect(healthResponse.body.environment).toBeDefined();
      
      console.log('✅ Health check passed');
    });

    test('Full Flow: Verify Data Persistence', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      authToken = loginResponse.body.token;

      // Create project
      const projectResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Persistence Test Project',
          objectives: 'Objective 1, Objective 2, Objective 3'
        })
        .expect(201);

      const projectId = projectResponse.body.data.id;

      // Verify project persists in database
      const project = await Project.findById(projectId);
      expect(project).toBeDefined();
      expect(project.title).toBe('Persistence Test Project');
      expect(Array.isArray(project.objectives)).toBe(true);
      expect(project.objectives.length).toBe(3);

      // Create task
      const taskResponse = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Persistence Test Task',
          projectId: projectId,
          status: 'todo'
        })
        .expect(201);

      const taskId = taskResponse.body.data.id;

      // Verify task persists in database
      const task = await Task.findById(taskId);
      expect(task).toBeDefined();
      expect(task.title).toBe('Persistence Test Task');
      expect(task.projectId.toString()).toBe(projectId);
      expect(task.status).toBe('todo');
    });

    test('Full Flow: Error Handling', async () => {
      // Try to create project without token
      const noTokenResponse = await request(app)
        .post('/api/v1/projects')
        .send({
          title: 'Test Project'
        })
        .expect(401);

      expect(noTokenResponse.body.success).toBe(false);
      expect(noTokenResponse.body.code).toBe('NO_TOKEN');

      // Login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      authToken = loginResponse.body.token;

      // Try to create project without required fields
      const invalidResponse = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing title'
        })
        .expect(400);

      expect(invalidResponse.body.success).toBe(false);
      expect(invalidResponse.body.code).toBe('INVALID_PAYLOAD');

      // Try to create task for non-existent project
      const fakeProjectId = new mongoose.Types.ObjectId();
      const taskResponse = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          projectId: fakeProjectId.toString()
        })
        .expect(404);

      expect(taskResponse.body.success).toBe(false);
      expect(taskResponse.body.code).toBe('NOT_FOUND');
    });
  });
});

