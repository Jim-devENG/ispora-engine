/**
 * Phase 2: Notifications Tests
 * Tests for notifications CRUD + SSE streaming
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
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
      console.warn('⚠️ MongoDB not available for notifications tests');
      throw error;
    }
  }
});

afterAll(async () => {
  await Notification.deleteMany({});
  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Phase 2: Notifications Tests', () => {
  let testUser;
  let testUser2;
  let authToken;
  let authToken2;
  let testProject;
  let testTask;
  let testNotification;

  beforeEach(async () => {
    await Notification.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
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

    // Create test project
    testProject = new Project({
      owner: testUser._id,
      title: 'Test Project',
      description: 'Test project description',
      objectives: ['Objective 1'],
      visibility: 'public'
    });
    await testProject.save();

    // Create test task
    testTask = new Task({
      title: 'Test Task',
      projectId: testProject._id,
      assignee: testUser2._id,
      status: 'todo'
    });
    await testTask.save();
  });

  describe('Notification Creation via Service', () => {
    test('Create notification via service', async () => {
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Test Notification',
        message: 'You have been assigned a task',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('task_assigned');
      expect(notification.title).toBe('Test Notification');
      expect(notification.read).toBe(false);
    });
  });

  describe('Notification Triggers', () => {
    test('Task assignment creates notification', async () => {
      // Create task with assignee (notification should be created automatically)
      const taskResponse = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Task',
          projectId: testProject._id.toString(),
          assignee: testUser2._id.toString(),
          status: 'todo'
        })
        .expect(201);

      // Wait a bit for async notification creation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check notification was created
      const notification = await Notification.findOne({
        userId: testUser2._id,
        type: 'task_assigned',
        relatedId: taskResponse.body.data.id
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('task_assigned');
      expect(notification.read).toBe(false);
    });
  });

  describe('GET /api/v1/notifications', () => {
    test('Get notifications for authenticated user', async () => {
      // Create test notification
      await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Test Notification',
        message: 'Test message',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.unreadCount).toBeGreaterThan(0);
    });

    test('Filter notifications by read status', async () => {
      // Create read and unread notifications
      await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Unread Notification',
        message: 'Unread',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const notification2 = await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Read Notification',
        message: 'Read',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      await notificationService.markAsRead(notification2.id, testUser._id.toString());

      // Get only unread notifications
      const response = await request(app)
        .get('/api/v1/notifications?read=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(n => !n.read)).toBe(true);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    test('Mark notification as read', async () => {
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Test Notification',
        message: 'Test message',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const response = await request(app)
        .patch(`/api/v1/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.read).toBe(true);
      expect(response.body.data.readAt).toBeDefined();

      // Verify in database
      const updatedNotification = await Notification.findById(notification.id);
      expect(updatedNotification.read).toBe(true);
      expect(updatedNotification.readAt).toBeDefined();
    });

    test('Cannot mark another user\'s notification as read', async () => {
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Test Notification',
        message: 'Test message',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const response = await request(app)
        .patch(`/api/v1/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    test('Mark all notifications as read', async () => {
      // Create multiple notifications
      await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Notification 1',
        message: 'Message 1',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Notification 2',
        message: 'Message 2',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const response = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedCount).toBeGreaterThan(0);

      // Verify all notifications are read
      const unreadCount = await Notification.countDocuments({
        userId: testUser._id,
        read: false
      });
      expect(unreadCount).toBe(0);
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    test('Delete notification', async () => {
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Test Notification',
        message: 'Test message',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const response = await request(app)
        .delete(`/api/v1/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify notification is deleted
      const deletedNotification = await Notification.findById(notification.id);
      expect(deletedNotification).toBeNull();
    });

    test('Cannot delete another user\'s notification', async () => {
      const notification = await notificationService.createNotification({
        userId: testUser._id,
        type: 'task_assigned',
        title: 'Test Notification',
        message: 'Test message',
        relatedId: testTask._id,
        relatedType: 'Task'
      });

      const response = await request(app)
        .delete(`/api/v1/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/notifications/stream', () => {
    test('SSE stream connection established', async (done) => {
      let eventCount = 0;

      const req = request(app)
        .get('/api/v1/notifications/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', 'text/event-stream');

      req.on('data', (chunk) => {
        const data = chunk.toString();
        if (data.includes('type')) {
          eventCount++;
          
          // Parse SSE data
          const lines = data.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonData = JSON.parse(line.substring(6));
              expect(jsonData).toHaveProperty('type');
              
              if (jsonData.type === 'connected') {
                expect(jsonData.message).toBe('Connected to notifications stream');
                req.end();
                done();
              }
            }
          }
        }
      });

      req.on('error', (error) => {
        console.error('SSE stream error:', error);
        done(error);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (eventCount === 0) {
          done(new Error('SSE stream timeout - no events received'));
        }
      }, 5000);
    });
  });
});

