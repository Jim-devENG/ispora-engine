/**
 * Tasks Tests (Mongoose)
 * Phase 1: Test tasks integration with MongoDB
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// Test database connection
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
});

afterAll(async () => {
  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 1: Tasks API', () => {
  let testUser;
  let testProject;
  let authToken;

  beforeEach(async () => {
    await Task.deleteMany({});
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

    // Create test project
    testProject = new Project({
      owner: testUser._id,
      title: 'Test Project',
      objectives: ['Objective 1']
    });
    await testProject.save();

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser._id.toString(), email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('POST /api/v1/tasks', () => {
    test('should create task for user project', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task description',
          projectId: testProject._id.toString(),
          status: 'todo',
          priority: 'high'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Test Task');
      expect(response.body.data.projectId).toBe(testProject._id.toString());
      expect(response.body.data.status).toBe('todo');
      expect(response.body.data.priority).toBe('high');

      // Verify in database
      const task = await Task.findById(response.body.data.id);
      expect(task).toBeDefined();
      expect(task.title).toBe('Test Task');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Test Task',
          projectId: testProject._id.toString()
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing title'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PAYLOAD');
    });

    test('should verify project exists', async () => {
      const fakeProjectId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          projectId: fakeProjectId.toString()
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    test('should prevent creating tasks for other users projects', async () => {
      // Create another user and project
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        passwordHash: await User.hashPassword('password123'),
        userType: 'student'
      });
      await otherUser.save();

      const otherProject = new Project({
        owner: otherUser._id,
        title: 'Other Project',
        objectives: ['Objective 1']
      });
      await otherProject.save();

      // Try to create task for other user's project
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unauthorized Task',
          projectId: otherProject._id.toString()
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/tasks/project/:projectId', () => {
    test('should get tasks for public project', async () => {
      // Create tasks
      const task1 = new Task({
        title: 'Task 1',
        projectId: testProject._id,
        status: 'todo'
      });
      await task1.save();

      const task2 = new Task({
        title: 'Task 2',
        projectId: testProject._id,
        status: 'doing'
      });
      await task2.save();

      // Get tasks (public project, no auth required)
      const response = await request(app)
        .get(`/api/v1/tasks/project/${testProject._id.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    test('should require authentication for private projects', async () => {
      // Make project private
      testProject.visibility = 'private';
      testProject.isPublic = false;
      await testProject.save();

      const response = await request(app)
        .get(`/api/v1/tasks/project/${testProject._id.toString()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    test('should update task status', async () => {
      // Create task
      const task = new Task({
        title: 'Test Task',
        projectId: testProject._id,
        status: 'todo'
      });
      await task.save();

      // Update status
      const response = await request(app)
        .patch(`/api/v1/tasks/${task._id.toString()}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'done'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('done');
      expect(response.body.data.completedDate).toBeDefined();

      // Verify in database
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.status).toBe('done');
      expect(updatedTask.completedDate).toBeDefined();
    });

    test('should require authentication', async () => {
      const task = new Task({
        title: 'Test Task',
        projectId: testProject._id,
        status: 'todo'
      });
      await task.save();

      const response = await request(app)
        .patch(`/api/v1/tasks/${task._id.toString()}/status`)
        .send({
          status: 'done'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    test('should validate status value', async () => {
      const task = new Task({
        title: 'Test Task',
        projectId: testProject._id,
        status: 'todo'
      });
      await task.save();

      const response = await request(app)
        .patch(`/api/v1/tasks/${task._id.toString()}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PAYLOAD');
    });
  });
});

