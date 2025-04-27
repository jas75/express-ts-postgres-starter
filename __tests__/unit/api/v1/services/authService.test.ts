import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { compare } from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  login,
  refreshToken,
  revokeRefreshToken
} from '../../../../../src/api/v1/services/authService';
import { AppError } from '../../../../../src/core/middleware/errorHandler';

// Valid UUID for testing
const MOCK_UUID = 'f0ad1a67-5705-4e48-bcd2-836a5ce6f2fa';

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Mock JWT to always return the expected token
jest.mock('jsonwebtoken');
(jwt.sign as jest.Mock) = jest.fn().mockReturnValue('fake-jwt-token');

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('fake-uuid')
}));

// Mock database
jest.mock('../../../../../src/core/database/postgresql', () => ({
  db: {
    query: jest.fn()
  }
}));

// Mock bcrypt to always return true for compare
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock logger
jest.mock('../../../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock user service
jest.mock('../../../../../src/api/v1/services/userService', () => ({
  getUserByEmail: jest.fn()
}));

// Import mocked modules
import { db } from '../../../../../src/core/database/postgresql';
import { getUserByEmail } from '../../../../../src/api/v1/services/userService';
import { v4 as uuidv4 } from 'uuid';

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a JWT token', () => {
      const payload = { id: MOCK_UUID, email: 'test@example.com', role: 'user' };
      
      const token = generateAccessToken(payload);
      
      expect(token).toBe('fake-jwt-token');
      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String));
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token and store it in the database', async () => {
      const userId = MOCK_UUID;
      (db.query as jest.Mock).mockResolvedValueOnce({});
      
      const token = await generateRefreshToken(userId);
      
      expect(token).toBe('fake-uuid');
      expect(db.query).toHaveBeenCalled();
      expect((db.query as jest.Mock).mock.calls[0][0]).toContain('INSERT INTO refresh_tokens');
      expect((db.query as jest.Mock).mock.calls[0][1]).toContain(userId);
    });

    it('should throw an AppError when database insertion fails', async () => {
      const userId = MOCK_UUID;
      (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      
      await expect(generateRefreshToken(userId)).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const mockUser = {
      id: MOCK_UUID,
      email: 'test@example.com',
      password: 'hashed_password',
      role: 'user',
      is_active: true
    };

    it('should successfully login and return tokens', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (compare as jest.Mock).mockResolvedValueOnce(true);
      (db.query as jest.Mock).mockResolvedValueOnce({}); // update last login
      
      const result = await login(credentials);
      
      expect(result).toHaveProperty('token', 'fake-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'fake-uuid');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw an AppError when user is not found', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce(null);
      
      await expect(login(credentials)).rejects.toThrow('Invalid email or password');
    });

    it('should throw an AppError when account is inactive', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        is_active: false
      });
      
      await expect(login(credentials)).rejects.toThrow('Account is inactive');
    });

    it('should throw an AppError when password is invalid', async () => {
      (getUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (compare as jest.Mock).mockResolvedValueOnce(false);
      
      await expect(login(credentials)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    const mockTokenId = 'refresh-token-id';
    const mockTokenData = {
      id: MOCK_UUID,
      email: 'test@example.com',
      role: 'user'
    };

    it('should refresh token and return new tokens', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockTokenData]
      });
      (db.query as jest.Mock).mockResolvedValueOnce({}); // Revoke old token
      
      const result = await refreshToken(mockTokenId);
      
      expect(result).toHaveProperty('token', 'fake-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'fake-uuid');
    });

    it('should throw an AppError when token is invalid or expired', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      await expect(refreshToken(mockTokenId)).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      const tokenId = 'token-id';
      (db.query as jest.Mock).mockResolvedValueOnce({});
      
      await expect(revokeRefreshToken(tokenId)).resolves.not.toThrow();
      
      expect(db.query).toHaveBeenCalled();
      expect((db.query as jest.Mock).mock.calls[0][0]).toContain('UPDATE refresh_tokens SET revoked = true');
    });

    it('should throw an AppError when database update fails', async () => {
      const tokenId = 'token-id';
      (db.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      
      await expect(revokeRefreshToken(tokenId)).rejects.toThrow(AppError);
    });
  });
}); 