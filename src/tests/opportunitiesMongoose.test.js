/**
 * Phase 2: Opportunities Tests
 * Tests for opportunities CRUD (admin only)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for opportunities tests');
      throw error;
    }
  }
});

afterAll(async () => {
  await Opportunity.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 2: Opportunities Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;

  beforeEach(async () => {
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
  });

  describe('POST /api/v1/opportunities', () => {
    test('Admin can create opportunity', async () => {
      const response = await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Software Engineer Position',
          description: 'Join our amazing team',
          type: 'job',
          category: 'Technology',
          organization: 'Tech Corp',
          location: 'Remote',
          workMode: 'remote',
          compensation: '$100k - $150k',
          deadline: '2025-12-31',
          applicationLink: 'https://example.com/apply',
          tags: ['software', 'engineering']
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Software Engineer Position');
      expect(response.body.data.type).toBe('job');
      expect(response.body.data.status).toBe('active');
    });

    test('Non-admin cannot create opportunity', async () => {
      const response = await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          title: 'Software Engineer Position',
          description: 'Join our amazing team',
          type: 'job'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
      expect(response.body.message).toContain('Admin access required');
    });

    test('Cannot create opportunity without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/opportunities')
        .send({
          title: 'Software Engineer Position',
          description: 'Join our amazing team',
          type: 'job'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NO_TOKEN');
    });
  });

  describe('GET /api/v1/opportunities', () => {
    test('Anyone can view opportunities (public)', async () => {
      // Create opportunity as admin
      await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Public Opportunity',
          description: 'Public description',
          type: 'scholarship',
          status: 'active',
          visibility: 'public'
        })
        .expect(201);

      // Regular user can view it
      const response = await request(app)
        .get('/api/v1/opportunities')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('Admin can view all opportunities including inactive', async () => {
      // Create active and inactive opportunities
      await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Active Opportunity',
          description: 'Active',
          type: 'job',
          status: 'active'
        })
        .expect(201);

      await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Closed Opportunity',
          description: 'Closed',
          type: 'job',
          status: 'closed'
        })
        .expect(201);

      // Admin can see all
      const response = await request(app)
        .get('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('Filter opportunities by type', async () => {
      await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Job Opportunity',
          description: 'Job',
          type: 'job'
        })
        .expect(201);

      await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Scholarship Opportunity',
          description: 'Scholarship',
          type: 'scholarship'
        })
        .expect(201);

      const response = await request(app)
        .get('/api/v1/opportunities?type=job')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(opp => opp.type === 'job')).toBe(true);
    });
  });

  describe('PUT /api/v1/opportunities/:id', () => {
    test('Admin can update opportunity', async () => {
      const createResponse = await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Original Title',
          description: 'Original description',
          type: 'job'
        })
        .expect(201);

      const opportunityId = createResponse.body.data.id;

      const updateResponse = await request(app)
        .put(`/api/v1/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe('Updated Title');
      expect(updateResponse.body.data.description).toBe('Updated description');
    });

    test('Non-admin cannot update opportunity', async () => {
      const createResponse = await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Original Title',
          description: 'Original description',
          type: 'job'
        })
        .expect(201);

      const opportunityId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          title: 'Updated Title'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/opportunities/:id', () => {
    test('Admin can delete opportunity', async () => {
      const createResponse = await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'To Be Deleted',
          description: 'Will be deleted',
          type: 'job'
        })
        .expect(201);

      const opportunityId = createResponse.body.data.id;

      const deleteResponse = await request(app)
        .delete(`/api/v1/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify opportunity is deleted
      const response = await request(app)
        .get(`/api/v1/opportunities/${opportunityId}`)
        .expect(404);
    });

    test('Non-admin cannot delete opportunity', async () => {
      const createResponse = await request(app)
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'To Be Deleted',
          description: 'Will be deleted',
          type: 'job'
        })
        .expect(201);

      const opportunityId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/opportunities/${opportunityId}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });
});

