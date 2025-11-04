/**
 * Projects Tests (Mongoose)
 * Phase 1: Test objectives normalization and project updates endpoint
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const jwt = require('jsonwebtoken');

// Test database connection
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
});

afterAll(async () => {
  // Clean up test database
  await Project.deleteMany({});
  await ProjectUpdate.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 1: Projects API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Clean up before each test
    await Project.deleteMany({});
    await ProjectUpdate.deleteMany({});
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

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser._id.toString(), email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('POST /api/v1/projects', () => {
    test('should create project with objectives as string (normalize to array)', async () => {
      const objectivesString = 'Objective 1\nObjective 2\nObjective 3';

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Project',
          description: 'Test description',
          objectives: objectivesString, // Frontend sends string
          type: 'academic',
          category: 'Education'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Test Project');
      
      // 🔑 CRITICAL: Verify objectives is stored as array (canonical format)
      expect(Array.isArray(response.body.data.objectives)).toBe(true);
      expect(response.body.data.objectives.length).toBe(3);
      expect(response.body.data.objectives).toEqual([
        'Objective 1',
        'Objective 2',
        'Objective 3'
      ]);

      // Verify in database
      const project = await Project.findById(response.body.data.id);
      expect(project).toBeDefined();
      expect(Array.isArray(project.objectives)).toBe(true);
      expect(project.objectives.length).toBe(3);
    });

    test('should create project with objectives as array (keep as array)', async () => {
      const objectivesArray = ['Objective 1', 'Objective 2', 'Objective 3'];

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Project Array',
          description: 'Test description',
          objectives: objectivesArray, // Already array
          type: 'academic'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Verify objectives is stored as array
      expect(Array.isArray(response.body.data.objectives)).toBe(true);
      expect(response.body.data.objectives).toEqual(objectivesArray);
    });

    test('should normalize objectives with comma-separated string', async () => {
      const objectivesString = 'Objective 1, Objective 2, Objective 3';

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Project Comma',
          objectives: objectivesString
        })
        .expect(201);

      // Verify objectives is normalized to array
      expect(Array.isArray(response.body.data.objectives)).toBe(true);
      expect(response.body.data.objectives.length).toBe(3);
      expect(response.body.data.objectives[0]).toBe('Objective 1');
      expect(response.body.data.objectives[1]).toBe('Objective 2');
      expect(response.body.data.objectives[2]).toBe('Objective 3');
    });

    test('should handle empty objectives string', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Project Empty',
          objectives: ''
        })
        .expect(201);

      // Verify objectives is empty array
      expect(Array.isArray(response.body.data.objectives)).toBe(true);
      expect(response.body.data.objectives.length).toBe(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .send({
          title: 'Test Project',
          objectives: 'Objective 1'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing title'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('GET /api/v1/projects/updates?mine=true', () => {
    test('should return updates for user projects only', async () => {
      // Create project for test user
      const project = new Project({
        owner: testUser._id,
        title: 'Test Project',
        objectives: ['Objective 1']
      });
      await project.save();

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

      // Create updates for both projects
      const update1 = new ProjectUpdate({
        projectId: project._id,
        author: testUser._id,
        content: 'Update 1 for user project',
        type: 'update'
      });
      await update1.save();

      const update2 = new ProjectUpdate({
        projectId: otherProject._id,
        author: otherUser._id,
        content: 'Update 2 for other project',
        type: 'update'
      });
      await update2.save();

      // Request updates for test user's projects only
      const response = await request(app)
        .get('/api/v1/projects/updates?mine=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should only return update for user's project
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].content).toBe('Update 1 for user project');
      expect(response.body.data[0].project.id).toBe(project._id.toString());
    });

    test('should return empty array if user has no projects', async () => {
      // Create another user with project
      const otherUser = new User({
        name: 'Other User',
        email: 'other2@example.com',
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

      const update = new ProjectUpdate({
        projectId: otherProject._id,
        author: otherUser._id,
        content: 'Update for other project',
        type: 'update'
      });
      await update.save();

      // Request updates for test user (who has no projects)
      const response = await request(app)
        .get('/api/v1/projects/updates?mine=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/projects/updates?mine=true')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });
  });
});

