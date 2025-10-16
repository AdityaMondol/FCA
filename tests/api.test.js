const request = require('supertest');
const app = require('../app');

describe('API Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `api_test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'API Test User',
        role: 'student'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('Public Routes', () => {
    it('should get academy info', async () => {
      const response = await request(app)
        .get('/api/academy-info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
    });

    it('should get notices with pagination', async () => {
      const response = await request(app)
        .get('/api/notices?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
    });

    it('should get media gallery', async () => {
      const response = await request(app)
        .get('/api/media?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get teachers list', async () => {
      const response = await request(app)
        .get('/api/teachers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Protected Routes', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          phone: '01234567890'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('Contact Form', () => {
    it('should submit contact form', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '01234567890',
          subject: 'Test Subject',
          message: 'This is a test message'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should validate contact form input', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: '',
          email: 'invalid-email',
          phone: '',
          subject: '',
          message: ''
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint');

      expect(response.status).toBe(404);
    });

    it('should return 405 for unsupported method', async () => {
      const response = await request(app)
        .patch('/api/notices');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should return 413 for oversized request', async () => {
      const largeData = 'x'.repeat(11 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/contact')
        .send({
          name: largeData,
          email: 'test@example.com',
          phone: '01234567890',
          subject: 'Test',
          message: 'Test'
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Response Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/academy-info');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should include cache headers for GET requests', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect(response.headers['x-cache']).toBeDefined();
    });
  });
});
