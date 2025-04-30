import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types';

// type AsyncRequestHandler<T = Request> = (
//   req: T,
//   res: Response,
//   next: NextFunction,
// ) => Promise<any> | any;

// /**
//  * Async handler to catch errors in async route handlers
//  * This prevents having to write try/catch blocks in each route handler
//  * Handles both synchronous and asynchronous errors
//  */
// export const asyncHandler =
//   <T = Request>(fn: AsyncRequestHandler<T>) =>
//   async (req: T, res: Response, next: NextFunction): Promise<any> => {
//     try {
//       await fn(req as T, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };

export const asyncHandler = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};
