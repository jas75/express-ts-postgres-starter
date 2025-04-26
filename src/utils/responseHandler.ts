import { Response } from 'express';
import { ApiResponse, HttpStatusCode } from '../core/types';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = HttpStatusCode.OK,
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message = 'An error occurred',
    statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    errors?: any,
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return this.success(res, data, message, HttpStatusCode.CREATED);
  }

  static noContent(res: Response): Response {
    return res.status(HttpStatusCode.NO_CONTENT).end();
  }

  static badRequest(res: Response, message = 'Bad request', errors?: any): Response {
    return this.error(res, message, HttpStatusCode.BAD_REQUEST, errors);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, HttpStatusCode.UNAUTHORIZED);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, HttpStatusCode.FORBIDDEN);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, HttpStatusCode.NOT_FOUND);
  }

  static conflict(res: Response, message = 'Conflict', errors?: any): Response {
    return this.error(res, message, HttpStatusCode.CONFLICT, errors);
  }

  static validationError(res: Response, errors: any): Response {
    return this.error(res, 'Validation failed', HttpStatusCode.UNPROCESSABLE_ENTITY, errors);
  }

  static paginatedSuccess<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success',
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message,
      data: {
        data,
        metadata: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };

    return res.status(HttpStatusCode.OK).json(response);
  }
}
