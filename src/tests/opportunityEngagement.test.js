/**
 * Phase 2.1: Opportunity Engagement Tests
 * Tests for opportunity engagement tracking (view/apply/bookmark/share + metrics)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const OpportunityEngagement = require('../models/OpportunityEngagement');
const OpportunityMetrics = require('../models/OpportunityMetrics');
const opportunityEngagementService = require('../services/opportunityEngagementService');

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for opportunity engagement tests');
      throw error;
    }
  }
});

afterAll(async () => {
  await OpportunityEngagement.deleteMany({});
  await OpportunityMetrics.deleteMany({});
  await Opportunity.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 2.1: Opportunity Engagement Tests', () => {
  let testUser;
  let testUser2;
  let authToken;
  let authToken2;
  let testOpportunity;

  beforeEach(async () => {
    await OpportunityEngagement.deleteMany({});
    await OpportunityMetrics.deleteMany({});
    await Opportunity.deleteMany({});
    await User.deleteMany({});

    // Create test users
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: await User.hashPassword('password123'),
      firstName: 'Test',
      lastName: 'User',
      userType: 'student'
    });
    await testUser.save();

    testUser2 = new User({
      name: 'Test User 2',
      email: 'test2@example.com',
      passwordHash: await User.hashPassword('password123'),
      firstName: 'Test2',
      lastName: 'User2',
      userType: 'student'
    });
    await testUser2.save();

    // Login to get tokens
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    authToken = loginResponse.body.token;

    const loginResponse2 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      })
      .expect(200);
    authToken2 = loginResponse2.body.token;

    // Create test opportunity
    testOpportunity = new Opportunity({
      title: 'Software Engineer Position',
      description: 'Join our team',
      type: 'job',
      status: 'active',
      visibility: 'public',
      createdBy: testUser._id
    });
    await testOpportunity.save();
  });

  describe('POST /api/v1/opportunities/:id/engagement', () => {
    test('Anonymous user can record view', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .send({
          type: 'view'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.metrics.views).toBeGreaterThan(0);

      // Verify anonymous view does not create engagement record
      const engagement = await OpportunityEngagement.findOne({
        opportunityId: testOpportunity._id,
        userId: null,
        type: 'view'
      });
      expect(engagement).toBeNull(); // Anonymous views don't create records
    });

    test('Authenticated user can record view', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'view'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics.views).toBeGreaterThan(0);

      // Verify metrics were incremented
      const metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics).toBeDefined();
      expect(metrics.views).toBeGreaterThan(0);
    });

    test('Authenticated user can bookmark opportunity', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'bookmark'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.engagement).toBeDefined();
      expect(response.body.data.engagement.type).toBe('bookmark');
      expect(response.body.data.metrics.bookmarks).toBe(1);

      // Verify engagement record was created
      const engagement = await OpportunityEngagement.findOne({
        opportunityId: testOpportunity._id,
        userId: testUser._id,
        type: 'bookmark'
      });
      expect(engagement).toBeDefined();

      // Verify metrics were incremented
      const metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics.bookmarks).toBe(1);
    });

    test('Authenticated user can apply to opportunity', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'apply'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.engagement).toBeDefined();
      expect(response.body.data.engagement.type).toBe('apply');
      expect(response.body.data.metrics.applies).toBe(1);

      // Verify engagement record was created
      const engagement = await OpportunityEngagement.findOne({
        opportunityId: testOpportunity._id,
        userId: testUser._id,
        type: 'apply'
      });
      expect(engagement).toBeDefined();

      // Verify metrics were incremented
      const metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics.applies).toBe(1);
    });

    test('Authenticated user can share opportunity', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'share',
          meta: {
            shareTo: 'twitter'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics.shares).toBe(1);

      // Verify metrics were incremented
      const metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics.shares).toBe(1);
    });

    test('Cannot bookmark without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .send({
          type: 'bookmark'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    test('Cannot apply without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .send({
          type: 'apply'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    test('Prevent duplicate bookmark', async () => {
      // Create first bookmark
      await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'bookmark'
        })
        .expect(200);

      // Try to bookmark again (should handle gracefully)
      const response = await request(app)
        .post(`/api/v1/opportunities/${testOpportunity._id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'bookmark'
        })
        .expect(200);

      // Metrics should not double-count (service handles duplicates)
      const metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics.bookmarks).toBe(1); // Should still be 1
    });
  });

  describe('GET /api/v1/opportunities/:id/metrics', () => {
    test('Get opportunity metrics', async () => {
      // Record some engagements
      await opportunityEngagementService.recordEngagement(
        testOpportunity._id,
        null,
        'view',
        {}
      );
      await opportunityEngagementService.recordEngagement(
        testOpportunity._id,
        testUser._id,
        'bookmark',
        {}
      );

      const response = await request(app)
        .get(`/api/v1/opportunities/${testOpportunity._id}/metrics`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.views).toBeGreaterThan(0);
      expect(response.body.data.bookmarks).toBe(1);
    });
  });

  describe('DELETE /api/v1/opportunities/:id/bookmark', () => {
    test('Remove bookmark', async () => {
      // Create bookmark
      await opportunityEngagementService.recordEngagement(
        testOpportunity._id,
        testUser._id,
        'bookmark',
        {}
      );

      // Verify bookmark exists
      let metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics.bookmarks).toBe(1);

      // Remove bookmark
      const response = await request(app)
        .delete(`/api/v1/opportunities/${testOpportunity._id}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmarks).toBe(0);

      // Verify bookmark was removed
      const engagement = await OpportunityEngagement.findOne({
        opportunityId: testOpportunity._id,
        userId: testUser._id,
        type: 'bookmark'
      });
      expect(engagement).toBeNull();
    });
  });

  describe('Atomic metric updates', () => {
    test('Multiple concurrent views increment correctly', async () => {
      // Simulate concurrent views
      const promises = Array(10).fill(null).map(() =>
        opportunityEngagementService.recordEngagement(
          testOpportunity._id,
          null,
          'view',
          {}
        )
      );

      await Promise.all(promises);

      // Verify metrics are correct
      const metrics = await OpportunityMetrics.findOne({ opportunityId: testOpportunity._id });
      expect(metrics.views).toBe(10);
    });
  });
});

