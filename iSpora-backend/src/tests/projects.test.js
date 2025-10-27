const request = require('supertest');
const app = require('../app');
const knex = require('knex');
const config = require('../knexfile');

const db = knex(config.test);

describe('Projects', () => {
  let authToken;
  let userId;

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

    // Create a test user and get auth token
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('password123', 12);
    
    userId = 'test-user-id';
    await db('users').insert({
      id: userId,
      email: 'test@example.com',
      password_hash: passwordHash,
      first_name: 'Test',
      last_name: 'User',
      user_type: 'student',
      username: 'testuser',
      is_verified: true,
      email_verified: true,
      profile_completed: false,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/projects', () => {
    it('should create a new project with valid data', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project description',
        type: 'academic',
        category: 'technology',
        tags: ['test', 'academic'],
        objectives: 'Test objectives',
        teamMembers: ['Test User'],
        diasporaPositions: ['Developer'],
        priority: 'high',
        university: 'Test University',
        mentorshipConnection: true,
        isPublic: true
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Project');
      expect(response.body.data.description).toBe('A test project description');
      expect(response.body.data.created_by).toBe(userId);
      expect(response.body.data.tags).toEqual(['test', 'academic']);
    });

    it('should return 400 for missing title', async () => {
      const projectData = {
        description: 'A test project description'
        // Missing title
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('title is required');
    });

    it('should return 400 for missing description', async () => {
      const projectData = {
        title: 'Test Project'
        // Missing description
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('description is required');
    });

    it('should return 401 without authentication token', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project description'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access token required');
    });

    it('should create a feed entry when project is created', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project description'
      };

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      // Check if feed entry was created
      const feedEntries = await db('feed_entries').where('type', 'project');
      expect(feedEntries).toHaveLength(1);
      expect(feedEntries[0].title).toContain('Test Project');
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Create test projects
      await db('projects').insert([
        {
          id: 'project-1',
          title: 'Project 1',
          description: 'Description 1',
          type: 'academic',
          category: 'technology',
          tags: JSON.stringify(['tech', 'academic']),
          objectives: 'Objectives 1',
          team_members: JSON.stringify(['User 1']),
          diaspora_positions: JSON.stringify(['Developer']),
          priority: 'high',
          university: 'University 1',
          mentorship_connection: true,
          is_public: true,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
          likes: 5,
          comments: 2,
          shares: 1
        },
        {
          id: 'project-2',
          title: 'Project 2',
          description: 'Description 2',
          type: 'community',
          category: 'social',
          tags: JSON.stringify(['social', 'community']),
          objectives: 'Objectives 2',
          team_members: JSON.stringify(['User 2']),
          diaspora_positions: JSON.stringify(['Manager']),
          priority: 'medium',
          university: 'University 2',
          mentorship_connection: false,
          is_public: true,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
          likes: 3,
          comments: 1,
          shares: 0
        }
      ]);
    });

    it('should return all public projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter projects by category', async () => {
      const response = await request(app)
        .get('/api/projects?category=technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('technology');
    });

    it('should filter projects by type', async () => {
      const response = await request(app)
        .get('/api/projects?type=academic')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('academic');
    });

    it('should search projects by title', async () => {
      const response = await request(app)
        .get('/api/projects?search=Project 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Project 1');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/projects?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      // Create a test project
      projectId = 'project-1';
      await db('projects').insert({
        id: projectId,
        title: 'Test Project',
        description: 'Test Description',
        type: 'academic',
        category: 'technology',
        tags: JSON.stringify(['test']),
        objectives: 'Test objectives',
        team_members: JSON.stringify(['Test User']),
        diaspora_positions: JSON.stringify(['Developer']),
        priority: 'high',
        university: 'Test University',
        mentorship_connection: true,
        is_public: true,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        likes: 0,
        comments: 0,
        shares: 0
      });
    });

    it('should return a specific project', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(projectId);
      expect(response.body.data.title).toBe('Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });
});
