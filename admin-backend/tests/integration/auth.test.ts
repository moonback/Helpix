import request from 'supertest';
import AdminBackendApp from '../../src/app';

describe('Auth Integration Tests', () => {
  let app: AdminBackendApp;
  let server: any;

  beforeAll(async () => {
    app = new AdminBackendApp();
    server = app.getApp();
  });

  afterAll(async () => {
    // Nettoyage
  });

  describe('POST /api/admin/auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      const response = await request(server)
        .post('/api/admin/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(server)
        .post('/api/admin/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(server)
        .post('/api/admin/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/auth/refresh-token', () => {
    it('should return 400 for missing refresh token', async () => {
      const response = await request(server)
        .post('/api/admin/auth/refresh-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/auth/check', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(server)
        .get('/api/admin/auth/check');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      const promises = [];
      
      // Faire plusieurs requêtes rapides
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(server)
            .post('/api/admin/auth/login')
            .send({
              email: 'test@test.com',
              password: 'password'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Au moins une requête devrait être limitée
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
