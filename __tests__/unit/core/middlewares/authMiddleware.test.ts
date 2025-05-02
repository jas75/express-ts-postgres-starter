import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authenticate, requireRole } from '../../../../src/core/middleware/authMiddleware';
import { AuthenticatedRequest } from '../../../../src/core/types/express';

type PassportCallback = (error: any, user: any, info: any) => void;

// Mock passport
jest.mock('passport', () => ({
  authenticate: jest.fn(),
}));

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {
        authorization: 'Bearer fake-token',
      },
      user: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn().mockReturnThis() as unknown as Response['json'],
    };
    next = jest.fn();

    (passport.authenticate as jest.Mock).mockImplementation(function mockPassportAuth(
      ...args: any[]
    ) {
      const cb = args[2] as PassportCallback;
      return function mockAuthReturn(_req: Request, _res: Response, _next: NextFunction): void {
        if (cb) {
          cb(null, null, null);
        }
      };
    });
  });

  describe('authenticate', () => {
    it('should call next() with user when authentication succeeds', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'user' as const,
        password: 'hashedpass',
        firstName: 'Test',
        lastName: 'User',
        is_active: true,
      };

      (passport.authenticate as jest.Mock).mockImplementation(function mockPassportAuth(
        ...args: any[]
      ) {
        const callback = args[2] as PassportCallback;
        return function mockAuthReturn(_req: Request, _res: Response, _next: NextFunction): void {
          callback(null, mockUser, null);
        };
      });

      authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(mockUser);
    });

    it('should call next() with error when authentication fails', () => {
      (passport.authenticate as jest.Mock).mockImplementation(function mockPassportAuth(
        ...args: any[]
      ) {
        const callback = args[2] as PassportCallback;
        return function mockAuthReturn(_req: Request, _res: Response, _next: NextFunction): void {
          callback(null, null, null);
        };
      });

      authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized - Invalid token',
          statusCode: 401,
        }),
      );
    });

    it('should call next() with error when passport throws an error', () => {
      const error = new Error('Authentication error');
      (passport.authenticate as jest.Mock).mockImplementation(function mockPassportAuth(
        ...args: any[]
      ) {
        const callback = args[2] as PassportCallback;
        return function mockAuthReturn(_req: Request, _res: Response, _next: NextFunction): void {
          callback(error, null, null);
        };
      });

      authenticate(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized - Invalid token',
          statusCode: 401,
        }),
      );
    });
  });

  describe('requireRole', () => {
    it('should call next() when user has the required role', () => {
      const mockReq = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: 'admin' as const,
          password: 'hashedpass',
          firstName: 'Test',
          lastName: 'User',
          is_active: true,
        },
      } as AuthenticatedRequest;

      const middleware = requireRole('user');
      middleware(mockReq, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next() when user has admin role regardless of required role', () => {
      const mockReq = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: 'admin' as const,
          password: 'hashedpass',
          firstName: 'Test',
          lastName: 'User',
          is_active: true,
        },
      } as AuthenticatedRequest;

      const middleware = requireRole('editor');
      middleware(mockReq, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next() with error when user does not have the required role', () => {
      const mockReq = {
        user: {
          id: '123',
          email: 'test@example.com',
          role: 'user' as const,
          password: 'hashedpass',
          firstName: 'Test',
          lastName: 'User',
          is_active: true,
        },
      } as AuthenticatedRequest;

      const middleware = requireRole('admin');
      middleware(mockReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Forbidden - Insufficient permissions',
          statusCode: 403,
        }),
      );
    });

    it('should call next() with error when user is not authenticated', () => {
      const mockReq = {} as AuthenticatedRequest;

      const middleware = requireRole('user');
      middleware(mockReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        }),
      );
    });
  });
});
