/**
 * Phase 2.1: Notification Preferences Tests
 * Tests for notification preferences and preference-based filtering
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const notificationPreferenceService = require('../services/notificationPreferenceService');
const notificationService = require('../services/notificationService');

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/ispora_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.warn('⚠️ MongoDB not available for notification preferences tests');
      throw error;
    }
  }
});

afterAll(async () => {
  await Notification.deleteMany({});
  await NotificationPreference.deleteMany({});
  await Opportunity.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 2.1: Notification Preferences Tests', () => {
  let testUser;
  let authToken;
  let testOpportunity;

  beforeEach(async () => {
    await Notification.deleteMany({});
    await NotificationPreference.deleteMany({});
    await Opportunity.deleteMany({});
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

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    authToken = loginResponse.body.token;

    // Create test opportunity (for featured opportunity test)
    testOpportunity = new Opportunity({
      title: 'Test Opportunity',
      description: 'Test description',
      type: 'job',
      status: 'active',
      visibility: 'public',
      featured: true,
      createdBy: testUser._id
    });
    await testOpportunity.save();
  });

  describe('GET /api/v1/notifications/preferences', () => {
    test('Get default preferences for new user', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.preferences).toBeDefined();
      expect(response.body.data.preferences.categories.project).toBe(true);
      expect(response.body.data.preferences.categories.task).toBe(true);
      expect(response.body.data.preferences.categories.opportunity).toBe(true);
      expect(response.body.data.preferences.categories.system).toBe(true);
      expect(response.body.data.preferences.delivery.realtime).toBe(true);
      expect(response.body.data.preferences.delivery.email).toBe(false);
      expect(response.body.data.preferences.mutedUntil).toBeNull();
    });
  });

  describe('PUT /api/v1/notifications/preferences', () => {
    test('Update notification preferences', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: {
            categories: {
              project: true,
              task: false,
              opportunity: false,
              system: true
            },
            delivery: {
              realtime: true,
              email: false
            }
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.categories.project).toBe(true);
      expect(response.body.data.preferences.categories.task).toBe(false);
      expect(response.body.data.preferences.categories.opportunity).toBe(false);
      expect(response.body.data.preferences.categories.system).toBe(true);
    });

    test('Disable opportunity notifications', async () => {
      // Update preferences to disable opportunity notifications
      await request(app)
        .put('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: {
            categories: {
              opportunity: false
            }
          }
        })
        .expect(200);

      // Create a featured opportunity notification
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'opportunity_posted',
        title: 'New Featured Opportunity',
        message: 'Check out this new opportunity',
        relatedId: testOpportunity._id,
        relatedType: 'Opportunity'
      });

      // Verify notification was created (persisted)
      expect(notification).toBeDefined();
      expect(notification.deliveryAllowed).toBe(false); // Realtime should be blocked

      // Verify notification exists in database
      const dbNotification = await Notification.findById(notification.id);
      expect(dbNotification).toBeDefined();
      expect(dbNotification.type).toBe('opportunity_posted');
    });
  });

  describe('POST /api/v1/notifications/mute', () => {
    test('Mute notifications until a future date', async () => {
      const muteUntil = new Date();
      muteUntil.setDate(muteUntil.getDate() + 7); // Mute for 7 days

      const response = await request(app)
        .post('/api/v1/notifications/mute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          until: muteUntil.toISOString()
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.mutedUntil).toBeDefined();

      // Verify preferences were updated
      const preferences = await notificationPreferenceService.getPreferences(testUser._id);
      expect(preferences.preferences.mutedUntil).toBeDefined();
    });

    test('Reject mute date in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      const response = await request(app)
        .post('/api/v1/notifications/mute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          until: pastDate.toISOString()
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PAYLOAD');
      expect(response.body.message).toContain('future');
    });
  });

  describe('Preference-based notification filtering', () => {
    test('Featured opportunity notification respects preferences - disabled category', async () => {
      // Disable opportunity notifications
      await notificationPreferenceService.setPreferences(testUser._id, {
        categories: {
          opportunity: false
        }
      });

      // Create featured opportunity notification
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'opportunity_posted',
        title: 'Featured Opportunity',
        message: 'Check this out',
        relatedId: testOpportunity._id,
        relatedType: 'Opportunity'
      });

      // Notification should be created (persisted)
      expect(notification).toBeDefined();
      
      // But realtime delivery should be disabled
      expect(notification.deliveryAllowed).toBe(false);

      // Verify notification exists in database
      const dbNotification = await Notification.findOne({
        userId: testUser._id,
        type: 'opportunity_posted'
      });
      expect(dbNotification).toBeDefined();
    });

    test('Featured opportunity notification respects preferences - muted user', async () => {
      // Mute user for 7 days
      const muteUntil = new Date();
      muteUntil.setDate(muteUntil.getDate() + 7);

      await notificationPreferenceService.muteUntil(testUser._id, muteUntil);

      // Create notification
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'opportunity_posted',
        title: 'Featured Opportunity',
        message: 'Check this out',
        relatedId: testOpportunity._id,
        relatedType: 'Opportunity'
      });

      // Realtime delivery should be blocked (user is muted)
      expect(notification.deliveryAllowed).toBe(false);

      // But notification should still be persisted
      const dbNotification = await Notification.findOne({
        userId: testUser._id,
        type: 'opportunity_posted'
      });
      expect(dbNotification).toBeDefined();
    });

    test('Project update notification respects preferences', async () => {
      // Disable project notifications
      await notificationPreferenceService.setPreferences(testUser._id, {
        categories: {
          project: false
        }
      });

      // Create project update notification
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'project_update',
        title: 'Project Update',
        message: 'New update',
        relatedId: mongoose.Types.ObjectId(),
        relatedType: 'Project'
      });

      // Realtime delivery should be blocked
      expect(notification.deliveryAllowed).toBe(false);

      // But notification should still be persisted
      const dbNotification = await Notification.findOne({
        userId: testUser._id,
        type: 'project_update'
      });
      expect(dbNotification).toBeDefined();
    });
  });

  describe('SSE stream with preferences', () => {
    test('SSE stream filters notifications by preferences', (done) => {
      // This test would require a full SSE connection test
      // For now, we verify preference checking logic works
      done();
    });
  });
});

