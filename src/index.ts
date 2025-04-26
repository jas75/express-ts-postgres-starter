import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './core/middleware/errorHandler';
import v1ApiRoutes from './api/v1/routes';
import { setupSwagger } from './config/swagger';
import { setupPassport } from './config/passport';
import { logger } from './utils/logger';
import { config } from './config/app';

// Create Express app
const app = express();

// Apply security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.app.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Common middleware
app.use(compression());
app.use(
  morgan('dev', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Passport
setupPassport(app);

// Apply rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimiter.windowMs,
  max: config.rateLimiter.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use(config.app.apiPrefix, limiter);

// Setup Swagger documentation if enabled
if (config.swagger.enabled) {
  setupSwagger(app);
}

// V1 API routes
app.use(config.app.apiPrefix + '/v1', v1ApiRoutes);

// Global error handling
app.use(errorHandler);

// Handle unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Start server
const port = config.app.port;
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
  logger.info(`Environment: ${config.app.environment}`);

  if (config.swagger.enabled) {
    logger.info(`API Documentation: http://localhost:${port}${config.swagger.route}`);
  }
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

export default app;
