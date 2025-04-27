import request from 'supertest';
import app from '../../setup';
import { db } from '../../../src/core/database/postgresql';

// Mocking database module
jest.mock('../../../src/core/database/postgresql', () => ({
  db: {
    query: jest.fn(),
  },
}));

describe('Users API', () => {
  // Use a fake token for testing
  const authToken = 'fake-test-token';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      // Mock db response
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'test1@example.com',
            first_name: 'Test1',
            last_name: 'User',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            email: 'test2@example.com',
            first_name: 'Test2',
            last_name: 'User',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        rowCount: 2,
      });

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      // Mock db response
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: userId,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        rowCount: 1,
      });

      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id', userId);
    });

    it('should return 404 for non-existent user', async () => {
      const userId = 'non-existent-id';

      // Mock empty response
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
