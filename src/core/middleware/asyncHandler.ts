import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types';

type AsyncRequestHandler = (
  req: Request | AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<any> | any;

/**
 * Async handler to catch errors in async route handlers
 * This prevents having to write try/catch blocks in each route handler
 * Handles both synchronous and asynchronous errors
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
