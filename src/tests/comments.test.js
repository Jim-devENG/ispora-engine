/**
 * Comments Tests
 * Phase 3: Test comment management endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
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
      await Comment.deleteMany({});
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

describe('Phase 3: Comments API', () => {
  let user1, user2;
  let project;
  let token1, token2;

  beforeEach(async () => {
    if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
      return;
    }
    await Comment.deleteMany({});
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

    token2 = jwt.sign(
      { id: user2._id.toString(), email: user2.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('POST /api/v1/comments', () => {
    test('should create a comment', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const response = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          parentType: 'project',
          parentId: project._id.toString(),
          content: 'This is a test comment'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('This is a test comment');
      expect(response.body.data).toHaveProperty('author');
    });
  });

  describe('GET /api/v1/comments', () => {
    test('should list comments for a parent', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Comment.create({
        author: user2._id,
        parentType: 'project',
        parentId: project._id,
        content: 'Test comment'
      });

      const response = await request(app)
        .get(`/api/v1/comments?parentType=project&parentId=${project._id.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('comments');
      expect(response.body.data.comments.length).toBe(1);
    });
  });

  describe('PATCH /api/v1/comments/:id', () => {
    test('should soft delete comment by author', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const comment = await Comment.create({
        author: user2._id,
        parentType: 'project',
        parentId: project._id,
        content: 'Test comment'
      });

      const response = await request(app)
        .patch(`/api/v1/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ deleted: true })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify comment is soft deleted
      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment.deleted).toBe(true);
    });

    test('should not allow deleting others comments', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const comment = await Comment.create({
        author: user1._id,
        parentType: 'project',
        parentId: project._id,
        content: 'Test comment'
      });

      const response = await request(app)
        .patch(`/api/v1/comments/${comment._id.toString()}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ deleted: true })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });
});

