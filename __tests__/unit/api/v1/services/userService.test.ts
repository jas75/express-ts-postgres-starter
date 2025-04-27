import { jest } from '@jest/globals';
import { hash } from 'bcrypt';
import {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  changeUserPassword
} from '../../../../../src/api/v1/services/userService';
import { AppError } from '../../../../../src/core/middleware/errorHandler';
import { User } from '../../../../../src/core/models/User';
import { QueryResult } from '../../../../../src/core/types';

// Valid UUID for testing
const MOCK_UUID = 'f0ad1a67-5705-4e48-bcd2-836a5ce6f2fa';

// Before doing anything else, set the NODE_ENV
process.env.NODE_ENV = 'test';

// Create a mock user that matches what we get from the db
const mockUser: User = {
  id: MOCK_UUID,
  email: 'test@example.com',
  password: 'hashedOldPassword',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  is_active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: new Date()
};

// Define types for our mocks
type MockQueryResult = {
  rows: any[];
  rowCount: number;
};

type MockClient = {
  query: jest.Mock<Promise<MockQueryResult>>;
};

// Mock the database module
jest.mock('../../../../../src/core/database/postgresql', () => ({
  db: {
    query: jest.fn(),
    transaction: jest.fn()
  }
}));

// Mock the bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock the logger
jest.mock('../../../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

// Import the mocked modules
import { db } from '../../../../../src/core/database/postgresql';
import { compare } from 'bcrypt';

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations after clearing mocks
    (hash as jest.Mock).mockResolvedValue('hashed_password');
    (compare as jest.Mock).mockResolvedValue(true);
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      // In test environment, we should return the full mocked user
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockUser], rowCount: 1 });

      const result = await getUserById(MOCK_UUID);
      
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [MOCK_UUID]);
    });

    it('should return null when user not found', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await getUserById(MOCK_UUID);
      
      expect(result).toBeNull();
    });

    it('should throw AppError when database query fails', async () => {
      const error = new Error('Database error');
      (db.query as jest.Mock).mockRejectedValue(error);

      await expect(getUserById(MOCK_UUID)).rejects.toThrow(AppError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when found', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const result = await getUserByEmail('test@example.com');
      
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    });

    it('should return null when user not found', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await getUserByEmail('test@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    it('should create a user successfully', async () => {
      const mockClient: MockClient = { 
        query: jest.fn() 
      };
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
      mockClient.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 }); // User created
      
      (db.transaction as jest.Mock).mockImplementationOnce((callback: (client: MockClient) => Promise<any>) => {
        return Promise.resolve(callback(mockClient));
      });

      const result = await createUser(userData);
      
      expect(result).toEqual(mockUser);
      expect(hash).toHaveBeenCalledWith(userData.password, expect.any(Number));
    });

    it('should throw AppError when user already exists', async () => {
      const mockClient: MockClient = { 
        query: jest.fn() 
      };
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: MOCK_UUID }], rowCount: 1 }); // Existing user
      
      (db.transaction as jest.Mock).mockImplementationOnce((callback: (client: MockClient) => Promise<any>) => {
        return Promise.resolve(callback(mockClient));
      });

      await expect(createUser(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('updateUser', () => {
    const userId = MOCK_UUID;
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };

    it('should update user successfully', async () => {
      const updatedUser: User = { 
        ...mockUser, 
        firstName: 'Updated', 
        lastName: 'Name' 
      };
      
      // Mock for getUserById
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SELECT * FROM users WHERE id = $1')) {
          return Promise.resolve({ rows: [mockUser], rowCount: 1 });
        }
        // For the update query
        return Promise.resolve({ rows: [updatedUser], rowCount: 1 });
      });

      const result = await updateUser(userId, updateData);
      
      expect(result).toHaveProperty('firstName', 'Updated');
      expect(result).toHaveProperty('lastName', 'Name');
    });

    it('should throw AppError when user not found', async () => {
      // First call to getUserById returns empty array
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(updateUser(userId, updateData)).rejects.toThrow('User not found');
    });
  });

  describe('changeUserPassword', () => {
    const userId = MOCK_UUID;
    const passwordData = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
      confirmPassword: 'newPassword'
    };

    it('should change password successfully', async () => {
      // Setup mock for getUserById
      (db.query as jest.Mock).mockImplementation((query: string) => {
        if (query.includes('SELECT * FROM users WHERE id = $1')) {
          return Promise.resolve({ rows: [mockUser], rowCount: 1 });
        }
        // For password update query
        return Promise.resolve({ rows: [], rowCount: 1 });
      });
      
      // Ensure password validation passes
      (compare as jest.Mock).mockResolvedValue(true);
      
      await changeUserPassword(userId, passwordData);
      
      // Verify the hash was called with the new password
      expect(hash).toHaveBeenCalledWith(passwordData.newPassword, expect.any(Number));
      
      // Verify db.query was called for the update
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', 
        ['hashed_password', userId]
      );
    });

    it('should throw AppError when current password is incorrect', async () => {
      // Setup mock for getUserById
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockUser], rowCount: 1 });
      
      // Mock password comparison to fail
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(changeUserPassword(userId, passwordData))
        .rejects.toThrow('Current password is incorrect');
    });

    it('should throw AppError when user not found', async () => {
      // User not found
      (db.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });

      await expect(changeUserPassword(userId, passwordData))
        .rejects.toThrow('User not found');
    });
  });
}); 