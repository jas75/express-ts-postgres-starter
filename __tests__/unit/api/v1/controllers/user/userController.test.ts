import { jest } from '@jest/globals';
import { Response } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../../../../../../src/api/v1/controllers/user/userController';
import { AuthenticatedRequest } from '../../../../../../src/core/types';
import { ResponseHandler } from '../../../../../../src/utils/responseHandler';

// Mock the user service
jest.mock('../../../../../../src/api/v1/services/userService', () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  changeUserPassword: jest.fn(),
}));

// Mock the response handler
jest.mock('../../../../../../src/utils/responseHandler', () => ({
  ResponseHandler: {
    success: jest.fn(),
    notFound: jest.fn(),
  },
}));

// Import mocked modules
import {
  getUserById,
  updateUser,
  changeUserPassword,
} from '../../../../../../src/api/v1/services/userService';

// Valid UUID for testing
const MOCK_UUID = 'f0ad1a67-5705-4e48-bcd2-836a5ce6f2fa';

describe('User Controller', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        id: MOCK_UUID,
        email: 'test@example.com',
        role: 'user',
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock ResponseHandler success and notFound to call res.json
    (ResponseHandler.success as jest.Mock).mockImplementation((res, data, message) => {
      return res.json({ status: 'success', message, data });
    });

    (ResponseHandler.notFound as jest.Mock).mockImplementation((res, message) => {
      return res.status(404).json({ status: 'error', message });
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when user exists', async () => {
      const mockUser = {
        id: MOCK_UUID,
        email: 'test@example.com',
        password: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
      };

      (getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      await getUserProfile(req as AuthenticatedRequest, res as Response);

      expect(getUserById).toHaveBeenCalledWith(MOCK_UUID);
      expect(ResponseHandler.success).toHaveBeenCalled();

      // Verify that the returned user doesn't contain the password
      const responseData = (ResponseHandler.success as jest.Mock).mock.calls[0][1];
      expect(responseData.user).not.toHaveProperty('password');
    });

    it('should return not found when user does not exist', async () => {
      (getUserById as jest.Mock).mockResolvedValueOnce(null);

      await getUserProfile(req as AuthenticatedRequest, res as Response);

      expect(ResponseHandler.notFound).toHaveBeenCalledWith(res, 'User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      req.body = updateData;

      const mockUpdatedUser = {
        id: MOCK_UUID,
        email: 'test@example.com',
        password: 'hashed_password',
        first_name: 'Updated',
        last_name: 'User',
        role: 'user',
      };

      (updateUser as jest.Mock).mockResolvedValueOnce(mockUpdatedUser);

      await updateUserProfile(req as AuthenticatedRequest, res as Response);

      expect(updateUser).toHaveBeenCalledWith(MOCK_UUID, updateData);
      expect(ResponseHandler.success).toHaveBeenCalled();

      // Verify that the returned user doesn't contain the password
      const responseData = (ResponseHandler.success as jest.Mock).mock.calls[0][1];
      expect(responseData.user).not.toHaveProperty('password');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      req.body = passwordData;

      (changeUserPassword as jest.Mock).mockResolvedValueOnce(undefined);

      await changePassword(req as AuthenticatedRequest, res as Response);

      expect(changeUserPassword).toHaveBeenCalledWith(MOCK_UUID, passwordData);
      expect(ResponseHandler.success).toHaveBeenCalledWith(
        res,
        null,
        'Password changed successfully',
      );
    });
  });
});
