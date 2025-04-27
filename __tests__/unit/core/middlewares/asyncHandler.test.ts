import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../../../src/core/middleware/asyncHandler';

describe('Async Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call the handler function with request, response, and next', async () => {
    // Create a mock handler function
    const mockHandler = jest.fn().mockResolvedValue('success');
    
    // Create async handler middleware
    const middleware = asyncHandler(mockHandler);
    
    // Call middleware
    await middleware(req as Request, res as Response, next);
    
    // Verify handler was called with correct arguments
    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
  });

  it('should not call next when handler resolves successfully', async () => {
    // Create a mock handler that resolves
    const mockHandler = jest.fn().mockResolvedValue('success');
    
    // Create async handler middleware
    const middleware = asyncHandler(mockHandler);
    
    // Call middleware
    await middleware(req as Request, res as Response, next);
    
    // Verify next was not called because there was no error
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when handler rejects', async () => {
    // Create a mock error
    const mockError = new Error('Test error');
    
    // Create a mock handler that rejects
    const mockHandler = jest.fn().mockRejectedValue(mockError);
    
    // Create async handler middleware
    const middleware = asyncHandler(mockHandler);
    
    // Call middleware
    await middleware(req as Request, res as Response, next);
    
    // Verify next was called with the error
    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should handle synchronous errors in the handler', async () => {
    // Create a mock error
    const mockError = new Error('Sync error');
    
    // Create a mock handler that throws synchronously
    const mockHandler = jest.fn().mockImplementation(() => {
      throw mockError;
    });
    
    // Create async handler middleware
    const middleware = asyncHandler(mockHandler);
    
    // Call middleware
    await middleware(req as Request, res as Response, next);
    
    // Verify next was called with the error
    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should handle handlers that return non-promise values', async () => {
    // Create a mock handler that returns a non-promise value
    const mockHandler = jest.fn().mockReturnValue('success');
    
    // Create async handler middleware
    const middleware = asyncHandler(mockHandler);
    
    // Call middleware
    await middleware(req as Request, res as Response, next);
    
    // Verify handler was called and next was not called with error
    expect(mockHandler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
}); 