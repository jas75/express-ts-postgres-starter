import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../../../src/core/middleware/validationMiddleware';

// Mock the logger
jest.mock('../../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Validation Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      path: '/api/test',
      method: 'POST',
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it('should call next() when validation passes', async () => {
    // Create a simple schema for testing
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    // Set valid data
    req.body = {
      name: 'Test User',
      age: 30,
    };

    // Create validator middleware
    const validator = validate(schema);

    // Call middleware
    await validator(req as Request, res as Response, next);

    // Verify next was called
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(error) when validation fails', async () => {
    // Create a simple schema for testing
    const schema = z.object({
      name: z.string(),
      age: z.number().positive(),
    });

    // Set invalid data
    req.body = {
      name: 123, // Should be string
      age: -5, // Should be positive
    };

    // Create validator middleware
    const validator = validate(schema);

    // Call middleware
    await validator(req as Request, res as Response, next);

    // Verify next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
  });

  it('should validate nested objects correctly', async () => {
    // Create a schema with nested objects
    const schema = z.object({
      user: z.object({
        name: z.string(),
        contact: z.object({
          email: z.string().email(),
          phone: z.string().optional(),
        }),
      }),
    });

    // Set valid nested data
    req.body = {
      user: {
        name: 'Test User',
        contact: {
          email: 'test@example.com',
          phone: '123-456-7890',
        },
      },
    };

    // Create validator middleware
    const validator = validate(schema);

    // Call middleware
    await validator(req as Request, res as Response, next);

    // Verify next was called without error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should validate arrays correctly', async () => {
    // Create a schema with an array
    const schema = z.object({
      tags: z.array(z.string()),
    });

    // Set valid array data
    req.body = {
      tags: ['tag1', 'tag2', 'tag3'],
    };

    // Create validator middleware
    const validator = validate(schema);

    // Call middleware
    await validator(req as Request, res as Response, next);

    // Verify next was called without error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
