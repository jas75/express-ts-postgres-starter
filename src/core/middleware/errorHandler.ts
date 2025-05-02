import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { ZodError } from 'zod';
import { HttpStatusCode } from '../types';
import { ResponseHandler } from '../../utils/responseHandler';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log error details
  const logData = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  };

  // Different error types
  if (err instanceof AppError) {
    const statusCode = err.statusCode;

    if (statusCode >= 500) {
      logger.error('Server error', logData);
    } else {
      logger.warn('Client error', logData);
    }

    return ResponseHandler.error(res, err.message, statusCode);
  }

  if (err instanceof ZodError) {
    logger.warn('Validation error', { ...logData, validationErrors: err.errors });

    return ResponseHandler.validationError(res, err.errors);
  }

  // Unhandled errors
  logger.error('Unhandled error', logData);

  return ResponseHandler.error(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    HttpStatusCode.INTERNAL_SERVER_ERROR,
  );
};
