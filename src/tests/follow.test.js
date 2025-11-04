/**
 * Follow Tests
 * Phase 3: Test follow graph management endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Follow = require('../models/Follow');
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
      await Follow.deleteMany({});
      await User.deleteMany({});
      await mongoose.connection.close();
    }
  } catch (error) {
    if (mongoose.connection.readyState !== 0) {
      console.error('Error cleaning up test database:', error.message);
    }
  }
}, 10000);

describe('Phase 3: Follow API', () => {
  let user1, user2;
  let token1, token2;

  beforeEach(async () => {
    if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
      return;
    }
    await Follow.deleteMany({});
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

  describe('POST /api/v1/follow', () => {
    test('should follow a user', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const response = await request(app)
        .post('/api/v1/follow')
        .set('Authorization', `Bearer ${token1}`)
        .send({ followeeId: user2._id.toString() })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('follower');
      expect(response.body.data).toHaveProperty('followee');
    });

    test('should return 409 if already following', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Follow.create({
        follower: user1._id,
        followee: user2._id
      });

      const response = await request(app)
        .post('/api/v1/follow')
        .set('Authorization', `Bearer ${token1}`)
        .send({ followeeId: user2._id.toString() })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('DUPLICATE_FOLLOW');
    });

    test('should return 400 if trying to follow yourself', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      const response = await request(app)
        .post('/api/v1/follow')
        .set('Authorization', `Bearer ${token1}`)
        .send({ followeeId: user1._id.toString() })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/follow/:followeeId', () => {
    test('should unfollow a user', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Follow.create({
        follower: user1._id,
        followee: user2._id
      });

      const response = await request(app)
        .delete(`/api/v1/follow/${user2._id.toString()}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify follow is deleted
      const follow = await Follow.findOne({
        follower: user1._id,
        followee: user2._id
      });
      expect(follow).toBeNull();
    });
  });

  describe('GET /api/v1/follow/:userId/followers', () => {
    test('should get followers', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Follow.create({
        follower: user1._id,
        followee: user2._id
      });

      const response = await request(app)
        .get(`/api/v1/follow/${user2._id.toString()}/followers`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('followers');
      expect(response.body.data.followers.length).toBe(1);
    });
  });

  describe('GET /api/v1/follow/:userId/following', () => {
    test('should get following list', async () => {
      if (process.env.SKIP_TESTS === 'true' || mongoose.connection.readyState === 0) {
        return;
      }
      await Follow.create({
        follower: user1._id,
        followee: user2._id
      });

      const response = await request(app)
        .get(`/api/v1/follow/${user1._id.toString()}/following`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('following');
      expect(response.body.data.following.length).toBe(1);
    });
  });
});

