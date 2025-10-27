const request = require('supertest');
const app = require('../app');
const knex = require('knex');
const config = require('../knexfile');

const db = knex(config.test);

describe('Authentication', () => {
  beforeAll(async () => {
    // Run migrations for test database
    await db.migrate.latest();
  });

  afterAll(async () => {
    // Clean up
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean up users table before each test
    await db('users').del();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.first_name).toBe('Test');
      expect(response.body.user.last_name).toBe('User');
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
        // Missing firstName and lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('6 characters');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      // Register first user
      const firstResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(firstResponse.status).toBe(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      await db('users').insert({
        id: 'test-user-id',
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
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should return 400 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return 400 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      // Create a test user and get token
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      await db('users').insert({
        id: 'test-user-id',
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

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.first_name).toBe('Test');
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access token required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid token');
    });
  });
});
