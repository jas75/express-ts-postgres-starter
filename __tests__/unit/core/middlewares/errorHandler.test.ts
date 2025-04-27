import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError, errorHandler } from '../../../../src/core/middleware/errorHandler';
import { ResponseHandler } from '../../../../src/utils/responseHandler';

// Mock the response handler
jest.mock('../../../../src/utils/responseHandler', () => ({
  ResponseHandler: {
    error: jest.fn(),
    validationError: jest.fn(),
  },
}));

// Mock the logger
jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment
    process.env.NODE_ENV = 'development';

    req = {
      originalUrl: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      headers: {},
      body: {},
      params: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Mock response handler methods
    (ResponseHandler.error as jest.Mock).mockImplementation((res, message, statusCode) => {
      res.status(statusCode).json({ status: 'error', message });
    });

    (ResponseHandler.validationError as jest.Mock).mockImplementation((res, errors) => {
      res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    });
  });

  describe('AppError', () => {
    it('should create an AppError with statusCode and message', () => {
      const error = new AppError('Test error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError with client error status code', () => {
      const error = new AppError('Bad request', 400);

      errorHandler(error, req as Request, res as Response, next);

      expect(ResponseHandler.error).toHaveBeenCalledWith(res, 'Bad request', 400);
    });

    it('should handle AppError with server error status code', () => {
      const error = new AppError('Internal server error', 500);

      errorHandler(error, req as Request, res as Response, next);

      expect(ResponseHandler.error).toHaveBeenCalledWith(res, 'Internal server error', 500);
    });

    it('should handle ZodError', () => {
      // Create a zod schema for testing
      const schema = z.object({
        name: z.string(),
        age: z.number().positive(),
      });

      // Try to validate invalid data to get a ZodError
      try {
        schema.parse({ name: 123, age: -5 });
      } catch (error) {
        errorHandler(error as ZodError, req as Request, res as Response, next);

        expect(ResponseHandler.validationError).toHaveBeenCalledWith(res, expect.any(Array));
      }
    });

    it('should handle generic Error in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Some unexpected error');

      errorHandler(error, req as Request, res as Response, next);

      expect(ResponseHandler.error).toHaveBeenCalledWith(
        res,
        'Internal server error', // Generic message in production
        500,
      );
    });

    it('should handle generic Error in development mode with actual message', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Some unexpected error');

      errorHandler(error, req as Request, res as Response, next);

      expect(ResponseHandler.error).toHaveBeenCalledWith(
        res,
        'Some unexpected error', // Actual message in development
        500,
      );
    });
  });
});
