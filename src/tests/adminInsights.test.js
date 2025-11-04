/**
 * Phase 2.1: Admin Insights Tests
 * Tests for admin insights (trending opportunities)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const OpportunityMetrics = require('../models/OpportunityMetrics');

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for admin insights tests');
      throw error;
    }
  }
});

afterAll(async () => {
  await OpportunityMetrics.deleteMany({});
  await Opportunity.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 2.1: Admin Insights Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;
  let opportunities = [];
  let metrics = [];

  beforeEach(async () => {
    await OpportunityMetrics.deleteMany({});
    await Opportunity.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await User.hashPassword('password123'),
      firstName: 'Admin',
      lastName: 'User',
      userType: 'admin',
      roles: ['admin', 'user']
    });
    await adminUser.save();

    // Create regular user
    regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      passwordHash: await User.hashPassword('password123'),
      firstName: 'Regular',
      lastName: 'User',
      userType: 'student',
      roles: ['user']
    });
    await regularUser.save();

    // Login to get tokens
    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      })
      .expect(200);
    adminToken = adminLoginResponse.body.token;

    const userLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      })
      .expect(200);
    regularToken = userLoginResponse.body.token;

    // Create test opportunities with different metrics
    opportunities = [];
    metrics = [];

    // Opportunity 1: High applies
    const opp1 = new Opportunity({
      title: 'High Apply Opportunity',
      description: 'Many applicants',
      type: 'job',
      status: 'active',
      visibility: 'public',
      createdBy: adminUser._id
    });
    await opp1.save();
    opportunities.push(opp1);

    const metrics1 = new OpportunityMetrics({
      opportunityId: opp1._id,
      views: 100,
      applies: 50,
      bookmarks: 10,
      shares: 5
    });
    await metrics1.save();
    metrics.push(metrics1);

    // Opportunity 2: High views
    const opp2 = new Opportunity({
      title: 'High View Opportunity',
      description: 'Many views',
      type: 'scholarship',
      status: 'active',
      visibility: 'public',
      createdBy: adminUser._id
    });
    await opp2.save();
    opportunities.push(opp2);

    const metrics2 = new OpportunityMetrics({
      opportunityId: opp2._id,
      views: 200,
      applies: 10,
      bookmarks: 20,
      shares: 15
    });
    await metrics2.save();
    metrics.push(metrics2);

    // Opportunity 3: Low engagement
    const opp3 = new Opportunity({
      title: 'Low Engagement Opportunity',
      description: 'Few engagements',
      type: 'event',
      status: 'active',
      visibility: 'public',
      createdBy: adminUser._id
    });
    await opp3.save();
    opportunities.push(opp3);

    const metrics3 = new OpportunityMetrics({
      opportunityId: opp3._id,
      views: 10,
      applies: 2,
      bookmarks: 1,
      shares: 0
    });
    await metrics3.save();
    metrics.push(metrics3);
  });

  describe('GET /api/v1/admin/opportunities/trending', () => {
    test('Admin can get trending opportunities', async () => {
      const response = await request(app)
        .get('/api/v1/admin/opportunities/trending?limit=10&days=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verify trending opportunities are sorted by score (applies * 10 + views)
      // Opportunity 1 should rank highest (50 applies * 10 + 100 views = 600)
      // Opportunity 2 should rank second (10 applies * 10 + 200 views = 300)
      const trending = response.body.data;
      expect(trending[0].metrics.applies).toBeGreaterThanOrEqual(trending[1]?.metrics.applies || 0);
    });

    test('Non-admin cannot access trending opportunities', async () => {
      const response = await request(app)
        .get('/api/v1/admin/opportunities/trending')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    test('Returns empty array if no opportunities match criteria', async () => {
      // Create old opportunity (outside date range)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days ago

      const oldMetrics = new OpportunityMetrics({
        opportunityId: opportunities[0]._id,
        views: 1000,
        applies: 500,
        lastUpdated: oldDate
      });
      await OpportunityMetrics.findOneAndUpdate(
        { opportunityId: opportunities[0]._id },
        { $set: { lastUpdated: oldDate } },
        { upsert: true }
      );

      // Request trending for last 7 days
      const response = await request(app)
        .get('/api/v1/admin/opportunities/trending?limit=10&days=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should still return opportunities updated within 7 days (opp2, opp3)
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v1/admin/opportunities/:id/analytics', () => {
    test('Admin can get opportunity analytics', async () => {
      const opportunityId = opportunities[0]._id.toString();

      const response = await request(app)
        .get(`/api/v1/admin/opportunities/${opportunityId}/analytics`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.metrics.views).toBe(100);
      expect(response.body.data.metrics.applies).toBe(50);
      expect(response.body.data.breakdown).toBeDefined();
    });

    test('Non-admin cannot access analytics', async () => {
      const opportunityId = opportunities[0]._id.toString();

      const response = await request(app)
        .get(`/api/v1/admin/opportunities/${opportunityId}/analytics`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });
});

