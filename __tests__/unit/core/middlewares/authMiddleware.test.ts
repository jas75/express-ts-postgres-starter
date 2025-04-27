import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authenticate, requireRole } from '../../../../src/core/middleware/authMiddleware';
import { AppError } from '../../../../src/core/middleware/errorHandler';

// Mock passport
jest.mock('passport', () => ({
  authenticate: jest.fn()
}));

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Add valid UUID and ensure req.headers is properly set up
    const MOCK_UUID = 'f0ad1a67-5705-4e48-bcd2-836a5ce6f2fa';

    // Update the req object to include headers.authorization
    req = {
      headers: {
        authorization: 'Bearer fake-token'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock passport.authenticate to call the callback function we provide
    (passport.authenticate as jest.Mock).mockImplementation(
      (strategy, options, callback) => {
        return (req: Request, res: Response, next: NextFunction) => {
          // Call the callback directly for testing
          callback(null, null, null);
          return;
        };
      }
    );
  });

  describe('authenticate', () => {
    it('should call next() with user when authentication succeeds', () => {
      // Mock successful authentication
      const mockUser = { id: '123', email: 'test@example.com', role: 'user' };
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, options, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(null, mockUser, null);
            return;
          };
        }
      );
      
      authenticate(req as Request, res as Response, next);
      
      // Verify user was set on request and next was called
      expect(req.user).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'user'
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next() with error when authentication fails', () => {
      // Mock failed authentication
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, options, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(null, null, null);
            return;
          };
        }
      );
      
      authenticate(req as Request, res as Response, next);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized - Invalid token',
          statusCode: 401
        })
      );
    });

    it('should call next() with error when passport throws an error', () => {
      // Mock error in passport
      const error = new Error('Authentication error');
      (passport.authenticate as jest.Mock).mockImplementation(
        (strategy, options, callback) => {
          return (req: Request, res: Response, next: NextFunction) => {
            callback(error, null, null);
            return;
          };
        }
      );
      
      authenticate(req as Request, res as Response, next);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication error: Authentication error',
          statusCode: 500
        })
      );
    });
  });

  describe('requireRole', () => {
    it('should call next() when user has the required role', () => {
      req.user = { id: '123', email: 'test@example.com', role: 'admin' };
      
      const middleware = requireRole('user');
      middleware(req as Request, res as Response, next);
      
      // Verify next was called without error
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next() when user has admin role regardless of required role', () => {
      req.user = { id: '123', email: 'test@example.com', role: 'admin' };
      
      const middleware = requireRole('editor');
      middleware(req as Request, res as Response, next);
      
      // Verify next was called without error
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next() with error when user does not have the required role', () => {
      req.user = { id: '123', email: 'test@example.com', role: 'user' };
      
      const middleware = requireRole('admin');
      middleware(req as Request, res as Response, next);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Forbidden - Insufficient permissions',
          statusCode: 403
        })
      );
    });

    it('should call next() with error when user is not authenticated', () => {
      req.user = undefined;
      
      const middleware = requireRole('user');
      middleware(req as Request, res as Response, next);
      
      // Verify next was called with an error
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401
        })
      );
    });
  });
}); 