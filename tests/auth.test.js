const request = require('supertest');
const app = require('../app');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

describe('Authentication Routes', () => {
  let testUserId;
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user_${Date.now()}@example.com`,
          password: 'ValidPassword123!',
          name: 'Test User',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      testUserId = response.body.user.id;
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'ValidPassword123!',
          name: 'Test User',
          role: 'student'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `user_${Date.now()}@example.com`,
          password: 'weak',
          name: 'Test User',
          role: 'student'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with duplicate email', async () => {
      const email = `user_${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'ValidPassword123!',
          name: 'Test User 1',
          role: 'student'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'ValidPassword123!',
          name: 'Test User 2',
          role: 'student'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    let loginTestEmail;

    beforeAll(async () => {
      loginTestEmail = `login_test_${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          email: loginTestEmail,
          password: 'ValidPassword123!',
          name: 'Login Test User',
          role: 'student'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginTestEmail,
          password: 'ValidPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginTestEmail,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'ValidPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      const email = `ratelimit_test_${Date.now()}@example.com`;
      
      for (let i = 0; i < 21; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'WrongPassword'
          });

        if (i < 20) {
          expect(response.status).not.toBe(429);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  });
});
