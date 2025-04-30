import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AppError } from './errorHandler';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) {
      return next(new AppError(`Authentication error: ${err.message}`, 500));
    }

    if (!user) {
      return next(new AppError('Unauthorized - Invalid token', 401));
    }

    // Attach the full user object to the request
    (req as AuthenticatedRequest).user = user;
    return next();
  })(req, res, next);
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return next(new AppError('Forbidden - Insufficient permissions', 403));
    }

    return next();
  };
};
