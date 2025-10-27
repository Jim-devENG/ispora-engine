const request = require('supertest');
const app = require('../app');
const knex = require('knex');
const config = require('../knexfile');

const db = knex(config.test);

describe('Feed', () => {
  beforeAll(async () => {
    // Run migrations for test database
    await db.migrate.latest();
  });

  afterAll(async () => {
    // Clean up
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await db('feed_entries').del();
    await db('projects').del();
    await db('users').del();

    // Create test users
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('password123', 12);
    
    await db('users').insert([
      {
        id: 'user-1',
        email: 'user1@example.com',
        password_hash: passwordHash,
        first_name: 'User',
        last_name: 'One',
        user_type: 'student',
        username: 'user1',
        is_verified: true,
        email_verified: true,
        profile_completed: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        password_hash: passwordHash,
        first_name: 'User',
        last_name: 'Two',
        user_type: 'admin',
        username: 'user2',
        is_verified: true,
        email_verified: true,
        profile_completed: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Create test projects
    await db('projects').insert([
      {
        id: 'project-1',
        title: 'Test Project 1',
        description: 'Description 1',
        type: 'academic',
        category: 'technology',
        tags: JSON.stringify(['tech']),
        objectives: 'Objectives 1',
        team_members: JSON.stringify(['User One']),
        diaspora_positions: JSON.stringify(['Developer']),
        priority: 'high',
        university: 'University 1',
        mentorship_connection: true,
        is_public: true,
        created_by: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        likes: 5,
        comments: 2,
        shares: 1
      }
    ]);

    // Create test feed entries
    await db('feed_entries').insert([
      {
        id: 'feed-1',
        type: 'project',
        title: 'New Project: Test Project 1',
        description: 'User One created a new project',
        category: 'technology',
        metadata: JSON.stringify({ project_id: 'project-1', action: 'created' }),
        user_id: 'user-1',
        project_id: 'project-1',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
        likes: 5,
        comments: 2,
        shares: 1
      },
      {
        id: 'feed-2',
        type: 'activity',
        title: 'User activity',
        description: 'User performed an activity',
        category: 'general',
        metadata: JSON.stringify({ action: 'login' }),
        user_id: 'user-2',
        project_id: null,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
        likes: 0,
        comments: 0,
        shares: 0
      }
    ]);
  });

  describe('GET /api/feed', () => {
    it('should return all feed entries', async () => {
      const response = await request(app)
        .get('/api/feed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter feed entries by type', async () => {
      const response = await request(app)
        .get('/api/feed?type=project')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('project');
    });

    it('should filter feed entries by category', async () => {
      const response = await request(app)
        .get('/api/feed?category=technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('technology');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/feed?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should include author and project information', async () => {
      const response = await request(app)
        .get('/api/feed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].author).toBeDefined();
      expect(response.body.data[0].author.name).toBe('User One');
      expect(response.body.data[0].project).toBeDefined();
      expect(response.body.data[0].project.title).toBe('Test Project 1');
    });
  });

  describe('POST /api/feed/activity', () => {
    it('should track activity successfully', async () => {
      const activityData = {
        type: 'login',
        title: 'User logged in',
        description: 'User successfully logged into the system',
        category: 'authentication',
        metadata: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }
      };

      const response = await request(app)
        .post('/api/feed/activity')
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('login');
      expect(response.body.data.title).toBe('User logged in');
    });

    it('should return 400 for missing required fields', async () => {
      const activityData = {
        description: 'Activity without type and title'
      };

      const response = await request(app)
        .post('/api/feed/activity')
        .send(activityData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Type and title are required');
    });

    it('should work without authentication', async () => {
      const activityData = {
        type: 'page_view',
        title: 'Anonymous page view',
        description: 'Someone viewed a page'
      };

      const response = await request(app)
        .post('/api/feed/activity')
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/feed/sessions', () => {
    it('should return active sessions', async () => {
      const response = await request(app)
        .get('/api/feed/sessions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/feed/stream', () => {
    it('should establish SSE connection', (done) => {
      const req = request(app)
        .get('/api/feed/stream')
        .expect(200)
        .expect('Content-Type', 'text/event-stream')
        .end((err, res) => {
          if (err) return done(err);
          
          let dataReceived = false;
          res.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('connected')) {
              dataReceived = true;
              res.destroy();
              done();
            }
          });
          
          // Timeout after 5 seconds
          setTimeout(() => {
            if (!dataReceived) {
              res.destroy();
              done(new Error('No data received from SSE stream'));
            }
          }, 5000);
        });
    });
  });
});
