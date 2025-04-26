import request from 'supertest';
import app from '../index';
import { db } from '../core/database/postgresql';

// Mock the database queries
jest.mock('../core/database/postgresql', () => ({
  query: jest.fn(),
}));

describe('Authentication API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock database response
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return validation error for invalid input', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: '123',
        first_name: '',
        last_name: 'User',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock getUserByEmail function return value
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test@example.com',
            password: '$2b$10$dummyhashedpassword',
            first_name: 'Test',
            last_name: 'User',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      // Mock bcrypt compare to return true
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true),
      }));

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
    });
  });
});
