import { Request, Response, NextFunction } from 'express';

type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any> | any;

/**
 * Async handler to catch errors in async route handlers
 * This prevents having to write try/catch blocks in each route handler
 * Handles both synchronous and asynchronous errors
 */
export const asyncHandler =
  (fn: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
