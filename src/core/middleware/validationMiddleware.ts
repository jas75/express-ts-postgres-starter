import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { logger } from '../../utils/logger';

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Validation - Request body received:', { 
        routePath: req.path,
        body: req.body,
        method: req.method
      });
      // Essayer de valider directement le body sans l'objet wrapper
      await schema.parseAsync(req.body);
      
      logger.info('Validation successful', { 
        routePath: req.path,
        method: req.method
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format de façon plus lisible les erreurs Zod
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        logger.error('Validation failed - Detailed errors:', { 
          routePath: req.path,
          body: req.body,
          errors: formattedErrors
        });
      } else {
        logger.error('Validation failed', { 
          routePath: req.path,
          body: req.body,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      next(error);
    }
  };
