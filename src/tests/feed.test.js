/**
 * Feed Tests
 * Phase 3: Test personalized feed endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectUpdate = require('../models/ProjectUpdate');
const Follow = require('../models/Follow');
const FeedPreference = require('../models/FeedPreference');
const jwt = require('jsonwebtoken');

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        serverSelectionTimeoutMS: 5000
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for tests. Skipping tests.');
      console.warn('   Set MONGO_TEST_URI environment variable or start MongoDB locally.');
      process.env.SKIP_TESTS = 'true';
    }
  }
}, 30000);

afterAll(async () => {
  if (process.env.SKIP_TESTS === 'true') {
    return;
  }
  try {
    if (mongoose.connection.readyState !== 0) {
      await FeedPreference.deleteMany({});
      await Follow.deleteMany({});
      await ProjectUpdate.deleteMany({});
      await Project.deleteMany({});
      await User.deleteMany({});
      await mongoose.connection.close();
    }
  } catch (error) {
    if (mongoose.connection.readyState !== 0) {
      console.error('Error cleaning up test database:', error.message);
    }
  }
}, 10000);

describe('Phase 3: Feed API', () => {
  let user1, user2;
  let project;
  let token1;

  beforeEach(async () => {
    if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
      return;
    }
    await FeedPreference.deleteMany({});
    await Follow.deleteMany({});
    await ProjectUpdate.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    user1 = new User({
      name: 'User One',
      email: 'user1@example.com',
      passwordHash: await User.hashPassword('password123')
    });
    await user1.save();

    user2 = new User({
      name: 'User Two',
      email: 'user2@example.com',
      passwordHash: await User.hashPassword('password123')
    });
    await user2.save();

    project = new Project({
      owner: user2._id,
      title: 'Test Project',
      description: 'Test description',
      visibility: 'public'
    });
    await project.save();

    token1 = jwt.sign(
      { id: user1._id.toString(), email: user1.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('GET /api/v1/feed', () => {
    test('should get feed items (all)', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await ProjectUpdate.create({
        projectId: project._id,
        author: user2._id,
        content: 'Test update',
        type: 'update'
      });

      const response = await request(app)
        .get('/api/v1/feed?type=all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    test('should get personalized feed if authenticated', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      // User1 follows user2
      await Follow.create({
        follower: user1._id,
        followee: user2._id
      });

      // Create feed preference
      await FeedPreference.create({
        userId: user1._id,
        sources: { projects: true, people: true, opportunities: true },
        sort: 'personalized'
      });

      // Create update
      await ProjectUpdate.create({
        projectId: project._id,
        author: user2._id,
        content: 'Test update',
        type: 'update'
      });

      const response = await request(app)
        .get('/api/v1/feed?type=personalized')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('GET /api/v1/feed/:id', () => {
    test('should get feed entry detail with comments and reactions', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const update = await ProjectUpdate.create({
        projectId: project._id,
        author: user2._id,
        content: 'Test update',
        type: 'update'
      });

      const response = await request(app)
        .get(`/api/v1/feed/${update._id.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type');
      expect(response.body.data).toHaveProperty('commentCount');
      expect(response.body.data).toHaveProperty('reactions');
    });
  });
});
