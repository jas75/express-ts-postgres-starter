# Usage Guide

This guide explains how to use the different features of the starter.

## Basic Route Structure

```typescript
// src/api/users/users.controller.ts
import { Router } from 'express';
import { validateRequest } from '@middlewares/validate';
import { createUserSchema } from './users.schema';

const router = Router();

router.post('/', validateRequest(createUserSchema), async (req, res) => {
  // Controller logic
});

export default router;
```

## Authentication

### User Registration

```typescript
// Request example
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});
```

### Login

```typescript
// Request example
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### Route Protection

```typescript
import { authMiddleware } from '@middlewares/auth';

router.get('/protected', authMiddleware, (req, res) => {
  // Protected route
});
```

## Database

### Creating a Migration

```bash
npm run migrate:create my_migration_name
```

### Migration Example

```typescript
// migrations/1234567890123_create_users.ts
exports.up = pgm => {
  pgm.createTable('users', {
    id: 'uuid',
    email: { type: 'varchar(255)', notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
};
```

## Data Validation

### Schema Definition

```typescript
// src/api/users/users.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});
```

## Logging

### Using the Logger

```typescript
import { logger } from '@utils/logger';

logger.info('Information message');
logger.error('An error occurred', { error });
logger.debug('Debug information');
```

## Tests

### Unit Test

```typescript
// __tests__/unit/users.service.test.ts
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(user).toBeDefined();
  });
});
```

### Integration Test

```typescript
// __tests__/integration/auth.test.ts
describe('POST /api/auth/login', () => {
  it('should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(response.status).toBe(200);
  });
});
```

## API Documentation

### Adding Swagger Documentation

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 */
```

## Available Scripts

```bash
# Development
npm run dev         # Start the server in development mode
npm run watch      # Watch TypeScript changes

# Tests
npm test           # Run all tests
npm run test:unit  # Run unit tests
npm run test:e2e   # Run end-to-end tests

# Database
npm run migrate:up    # Apply migrations
npm run migrate:down  # Rollback last migration

# Production
npm run build      # Build the project
npm start          # Start the server in production mode
```

## Best Practices

1. **File Structure**
   - One module per folder
   - Separation of concerns
   - Index.ts for exports

2. **Error Handling**
   - Use of custom error classes
   - Global error handling middleware
   - Appropriate logging

3. **Security**
   - Input validation
   - Data sanitization
   - Rate limiting
   - Secure headers

4. **Performance**
   - Appropriate caching
   - Result pagination
   - DB query optimization 