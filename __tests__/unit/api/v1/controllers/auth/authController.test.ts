import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import {
  loginUser as login,
  registerUser as register,
  refreshAuthToken as refreshTokens,
  logout,
} from '../../../../../../src/api/v1/modules/auth/authController';
import { ResponseHandler } from '../../../../../../src/utils/responseHandler';

// Mock services
jest.mock('../../../../../../src/api/v1/services/authService', () => ({
  login: jest.fn(),
  refreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
}));

jest.mock('../../../../../../src/api/v1/services/userService', () => ({
  createUser: jest.fn(),
}));

// Mock response handler
jest.mock('../../../../../../src/utils/responseHandler', () => ({
  ResponseHandler: {
    success: jest.fn(),
    error: jest.fn(),
    created: jest.fn(),
  },
}));

// Import mocked modules
import {
  login as loginService,
  refreshToken as refreshTokenService,
  revokeRefreshToken,
} from '../../../../../../src/api/v1/services/authService';
import { createUser } from '../../../../../../src/api/v1/services/userService';

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      cookies: {},
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    } as unknown as Partial<Response>;

    // Mock ResponseHandler success to call res.json
    (ResponseHandler.success as jest.Mock).mockImplementation(function (
      res: any,
      data: any,
      message: string,
    ) {
      return res.json({ status: 'success', message, data });
    });

    // Mock ResponseHandler error to call res.status().json()
    (ResponseHandler.error as jest.Mock).mockImplementation(function (
      res: any,
      message: string,
      statusCode: number,
    ) {
      return res.status(statusCode).json({ status: 'error', message });
    });
  });

  describe('login', () => {
    it('should login successfully and return user and tokens', async () => {
      // Setup request data
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock service response
      const mockServiceResponse = {
        user: { id: '123', email: 'test@example.com', role: 'user' },
        token: 'access-token',
        refreshToken: 'refresh-token',
      };

      (loginService as jest.Mock).mockResolvedValueOnce(mockServiceResponse);

      // Call controller
      await login(req as Request, res as Response, jest.fn());

      // Verify service was called with credentials
      expect(loginService).toHaveBeenCalledWith(req.body);

      // Verify response
      expect(ResponseHandler.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          user: mockServiceResponse.user,
          token: mockServiceResponse.token,
        }),
        'Login successful',
      );
    });
  });

  describe('register', () => {
    it('should register a new user and return user data', async () => {
      // Setup request data
      req.body = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      // Mock service response
      const mockUser = {
        id: '123',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        role: 'user',
        password: 'hashed_password',
      };

      (createUser as jest.Mock).mockResolvedValueOnce(mockUser);

      // Call controller
      await register(req as Request, res as Response, jest.fn());

      // Verify user was created
      expect(createUser).toHaveBeenCalledWith(req.body);

      // Verify response (without password)
      const userWithoutPassword = { ...mockUser } as Partial<typeof mockUser>;
      delete userWithoutPassword.password;

      expect(ResponseHandler.created).toHaveBeenCalledWith(
        res,
        { user: userWithoutPassword },
        'User registered successfully',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens when a valid refresh token is provided', async () => {
      // Setup refresh token in body instead of cookies
      req.body = { refreshTokenString: 'valid-refresh-token' };

      // Mock service response
      const mockTokens = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (refreshTokenService as jest.Mock).mockResolvedValueOnce(mockTokens);

      // Call controller
      await refreshTokens(req as Request, res as Response, jest.fn());

      // Verify service was called with token
      expect(refreshTokenService).toHaveBeenCalledWith('valid-refresh-token');

      // Verify response
      expect(ResponseHandler.success).toHaveBeenCalledWith(
        res,
        mockTokens,
        'Token refreshed successfully',
      );
    });

    it('should return error when no refresh token is provided', async () => {
      // Setup empty body
      req.body = {};

      // Call controller
      await refreshTokens(req as Request, res as Response, jest.fn());

      // Verify error response
      expect(ResponseHandler.error).toHaveBeenCalledWith(res, 'Refresh token is required', 400);
    });
  });

  describe('logout', () => {
    it('should logout successfully when a refresh token is provided', async () => {
      // Setup refresh token in cookies
      req.cookies = { refreshToken: 'valid-refresh-token' };

      // Mock service response
      (revokeRefreshToken as jest.Mock).mockResolvedValueOnce(undefined);

      // Call controller
      await logout(req as Request, res as Response, jest.fn());

      // Verify service was called with token
      expect(revokeRefreshToken).toHaveBeenCalledWith('valid-refresh-token');

      // Verify response
      expect(ResponseHandler.success).toHaveBeenCalledWith(res, null, 'Logout successful');
    });

    it('should still return success when no refresh token is provided', async () => {
      // Setup empty cookies and headers
      req.cookies = {};
      req.headers = {};

      // Call controller
      await logout(req as Request, res as Response, jest.fn());

      // Verify service was not called
      expect(revokeRefreshToken).not.toHaveBeenCalled();

      // Verify response is still success
      expect(ResponseHandler.success).toHaveBeenCalledWith(res, null, 'Logout successful');
    });
  });
});
