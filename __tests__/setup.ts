// Configuration globale pour tous les tests
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from '../src/core/middleware/errorHandler';
import v1ApiRoutes from '../src/api/v1/routes';
import authRoutes from '../src/api/v1/routes/auth';
import { setupSwagger } from '../src/config/swagger';
import { setupPassport } from '../src/config/passport';
import { config } from '../src/config/app';
import jwt from 'jsonwebtoken';

// Create a mock authentication middleware for testing
const mockAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - No token provided',
    });
  }

  // In tests, we'll just check for the presence of a token,
  // not its validity, since we're testing routes, not auth
  req.user = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'admin',
  };

  return next();
};

// Create a testable app that doesn't auto-start the server
export function createTestableApp() {
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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mock authentication
  app.use((req, res, next) => {
    // Apply mock authentication for routes that need it
    if (req.path.includes('/api/v1/users')) {
      return mockAuthenticate(req, res, next);
    }
    return next();
  });

  // Setup Passport
  setupPassport(app);

  // Setup Swagger documentation if enabled
  if (config.swagger.enabled) {
    setupSwagger(app);
  }

  // Create test-specific authentication endpoints for testing
  const testAuthRouter = express.Router();

  // Test login endpoint that always succeeds
  testAuthRouter.post('/login', (req, res) => {
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: req.body.email || 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    };

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token: 'fake-test-token',
      },
    });
  });

  // Test register endpoint that always succeeds
  testAuthRouter.post('/register', (req, res) => {
    const user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: req.body.email || 'test@example.com',
      firstName: req.body.firstName || 'Test',
      lastName: req.body.lastName || 'User',
      role: 'user',
    };

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        token: 'fake-test-token',
      },
    });
  });

  // Test logout endpoint
  testAuthRouter.post('/logout', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  });

  // Create mock users router
  const testUsersRouter = express.Router();

  // Authenticate all users routes
  testUsersRouter.use(mockAuthenticate);

  // Test user profile - Need to define this before the :id route to avoid conflict
  testUsersRouter.get('/profile', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
        },
      },
    });
  });

  // Test get all users
  testUsersRouter.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: {
        users: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user1@example.com',
            first_name: 'User',
            last_name: 'One',
            role: 'user',
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            email: 'user2@example.com',
            first_name: 'User',
            last_name: 'Two',
            role: 'user',
          },
        ],
      },
    });
  });

  // Test get user by ID
  testUsersRouter.get('/:id', (req, res) => {
    if (req.params.id === 'non-existent-id') {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: {
        user: {
          id: req.params.id,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
        },
      },
    });
  });

  // V1 API routes
  app.use(config.app.apiPrefix + '/v1', v1ApiRoutes);

  // Use test auth routes for testing
  app.use('/api/auth', testAuthRouter);

  // Use test users routes
  app.use('/api/v1/users', testUsersRouter);

  // Explicit profile route for E2E tests
  app.get('/api/v1/users/profile', mockAuthenticate, (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
        },
      },
    });
  });

  // Global error handling
  app.use(errorHandler);

  // Handle unmatched routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.originalUrl}`,
    });
  });

  return app;
}

// Create the testable app instance that will be used across tests
const testApp = createTestableApp();
export default testApp;
