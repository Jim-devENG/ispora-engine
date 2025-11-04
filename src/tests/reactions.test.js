/**
 * Reactions Tests
 * Phase 3: Test reaction management endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Reaction = require('../models/Reaction');
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
      await Reaction.deleteMany({});
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

describe('Phase 3: Reactions API', () => {
  let user1;
  let project;
  let token1;

  beforeEach(async () => {
    if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
      return;
    }
    await Reaction.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});

    user1 = new User({
      name: 'User One',
      email: 'user1@example.com',
      passwordHash: await User.hashPassword('password123')
    });
    await user1.save();

    project = new Project({
      owner: user1._id,
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

  describe('POST /api/v1/reactions', () => {
    test('should add a reaction', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const response = await request(app)
        .post('/api/v1/reactions')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          targetType: 'project',
          targetId: project._id.toString(),
          reactionType: 'like'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reactionType).toBe('like');

      // Verify reaction is created
      const reaction = await Reaction.findOne({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id
      });
      expect(reaction).not.toBeNull();
      expect(reaction.reactionType).toBe('like');
    });

    test('should update reaction if already exists', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Reaction.create({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id,
        reactionType: 'like'
      });

      const response = await request(app)
        .post('/api/v1/reactions')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          targetType: 'project',
          targetId: project._id.toString(),
          reactionType: 'love'
        })
        .expect(201);

      expect(response.body.data.reactionType).toBe('love');

      // Verify only one reaction exists
      const reactions = await Reaction.find({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id
      });
      expect(reactions.length).toBe(1);
      expect(reactions[0].reactionType).toBe('love');
    });
  });

  describe('DELETE /api/v1/reactions', () => {
    test('should remove a reaction', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Reaction.create({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id,
        reactionType: 'like'
      });

      const response = await request(app)
        .delete('/api/v1/reactions')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          targetType: 'project',
          targetId: project._id.toString()
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify reaction is deleted
      const reaction = await Reaction.findOne({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id
      });
      expect(reaction).toBeNull();
    });
  });

  describe('GET /api/v1/reactions', () => {
    test('should get reactions for a target', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Reaction.create({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id,
        reactionType: 'like'
      });

      const response = await request(app)
        .get(`/api/v1/reactions?targetType=project&targetId=${project._id.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('counts');
      expect(response.body.data.counts.like).toBe(1);
      expect(response.body.data.total).toBe(1);
    });

    test('should include viewer reaction if authenticated', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Reaction.create({
        userId: user1._id,
        targetType: 'project',
        targetId: project._id,
        reactionType: 'like'
      });

      const response = await request(app)
        .get(`/api/v1/reactions?targetType=project&targetId=${project._id.toString()}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.viewerReaction).not.toBeNull();
      expect(response.body.data.viewerReaction.reactionType).toBe('like');
    });
  });
});

