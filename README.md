# Express TypeScript PostgreSQL API

A robust API built with Express.js, TypeScript and PostgreSQL, following best architectural practices.

## Features

- **Modular Architecture**: Layered structure with separation of concerns
- **TypeScript**: Secure typed development on the server side
- **Express.js**: Fast and flexible web framework
- **PostgreSQL**: Powerful relational database
- **JWT Authentication**: Complete authentication management with access and refresh tokens
- **Swagger Documentation**: Interactive API documentation
- **Data Validation**: Request validation with Zod
- **Database Migrations**: Schema change management with db-migrate
- **Docker Support**: Ready configuration for development and production
- **Testing**: Unit and integration testing with Jest
- **Linting & Formatting**: ESLint and Prettier integration
- **Rate Limiting**: API request limitation for security
- **Logging**: Advanced logging with Winston
- **Error Handling**: Centralized error management and logging system
- **Transactional Management**: SQL transaction support
- **Environment Variables**: Complete configuration management

## Prerequisites

- Node.js (v18+)
- PostgreSQL
- Docker (optional)

## Quick Start

### Option 1: Local Execution

1. Clone the repository:

```bash
git clone <repository-url>
cd express-ts-postgres-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`

4. Run database migrations:

```bash
npm run migrate:up
```

5. Start the development server:

```bash
npm run dev
```

### Option 2: Using Docker

1. Clone the repository:

```bash
git clone <repository-url>
cd express-ts-postgres-api
```

2. Start Docker containers:

```bash
docker-compose up
```

## Project Structure

```
.
├── migrations/               # Database migrations
├── src/
│   ├── api/                  # API Layer
│   │   └── v1/               # API Version 1
│   │       ├── controllers/  # Request handlers
│   │       ├── routes/       # API endpoint definitions
│   │       └── services/     # Business logic for API v1
│   ├── config/               # Application configuration
│   ├── core/                 # Core Layer
│   │   ├── database/         # Database management
│   │   ├── middleware/       # Fundamental middleware
│   │   ├── models/           # Data models
│   │   └── types/            # Common types
│   ├── utils/                # Utilities and helpers
│   ├── __tests__/            # Tests
│   └── index.ts              # Application entry point
├── .env                      # Environment variables
├── .env.example              # Environment variables example
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker configuration
├── jest.config.js            # Jest configuration
├── migrate-config.js         # Database migration configuration
├── nodemon.json              # Nodemon configuration
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

## API Documentation

Once the server is started, you can access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

## Available Scripts

- `npm start`: Run the production server
- `npm run dev`: Run the development server with hot reloading
- `npm run build`: Build the TypeScript project
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run tests
- `npm run migrate:create <name>`: Create a new migration
- `npm run migrate:up`: Run migrations
- `npm run migrate:down`: Revert migrations

## Layer Organization

The project is organized in distinct layers:

1. **API Layer** (`api/`): Handles HTTP exposure with routes and controllers.
2. **Service Layer** (`services/`): Contains business logic and coordinates data access.
3. **Data Access Layer** (`core/database/`): Manages database interaction.
4. **Core Layer** (`core/`): Provides fundamental functionality used throughout the application.

This layered architecture allows better separation of concerns and easier maintenance.

## License

MIT

## Database Migrations

This project uses [node-pg-migrate](https://github.com/salsita/node-pg-migrate) to manage database migrations in TypeScript.

### Migration Commands

```bash
# Create a new migration
npm run migrate:create migration_name

# Run all pending migrations
npm run migrate:up

# Revert one migration
npm run migrate:down
```

### TypeScript Migration Example

```typescript
import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder): void => {
  // Create a table
  pgm.createTable('example', {
    id: {
      type: 'serial',
      primaryKey: true
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    active: {
      type: 'boolean',
      default: true
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  // Add an index
  pgm.createIndex('example', 'name');
};

export const down = (pgm: MigrationBuilder): void => {
  pgm.dropTable('example');
}; 