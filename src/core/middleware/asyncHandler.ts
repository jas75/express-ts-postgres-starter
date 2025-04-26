import { Request, Response, NextFunction } from 'express';

/**
 * Async handler to catch errors in async route handlers
 * This prevents having to write try/catch blocks in each route handler
 */
export const asyncHandler =
  (fn: Function) =>
  (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
