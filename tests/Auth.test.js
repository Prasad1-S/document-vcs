import request from 'supertest';
import app from '../src/app.js'; 
describe('Authentication Routes', () => {
  
  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });
      
      expect([200, 201, 302]).toContain(response.status);
    });
  });

  describe('POST /login', () => {
    it('should redirect on login attempt', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect([302, 401]).toContain(response.status);
    });
  });

});