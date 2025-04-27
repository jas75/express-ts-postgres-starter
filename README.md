# Express TypeScript PostgreSQL API

[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20.0+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15.0+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A robust and secure API built with Express.js, TypeScript and PostgreSQL, following best architectural practices.

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
- **Environment Variables**: Complete configuration management with validation
- **Security**: CORS protection, Helmet security headers, and SQL injection prevention
- **API Versioning**: Support for multiple API versions
- **Performance Monitoring**: Basic metrics and monitoring setup
- **CI/CD Ready**: GitHub Actions workflow templates included

## Prerequisites

- Node.js (v20+)
- PostgreSQL (v15+)
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


## Security Best Practices

- All passwords are hashed using bcrypt
- JWT tokens with short expiration time
- Rate limiting to prevent brute force attacks
- CORS configuration for allowed origins
- Helmet security headers enabled
- SQL injection prevention with parameterized queries
- Input validation with Zod
- Security headers configuration

## Project Structure

```
.
├── migrations/               # Database migrations
├── src/
│   ├── api/                 # API Layer
│   │   └── v1/             # API Version 1
│   │       ├── controllers/ # Request handlers
│   │       ├── routes/     # API endpoint definitions
│   │       └── services/   # Business logic for API v1
│   ├── config/             # Application configuration
│   ├── core/               # Core Layer
│   │   ├── database/       # Database management
│   │   ├── middleware/     # Fundamental middleware
│   │   ├── models/        # Data models
│   │   └── types/         # Common types
│   ├── utils/             # Utilities and helpers
│   └── index.ts           # Application entry point
├── __tests__/             # Test files
├── .env.example           # Environment variables example
├── .env.test             # Test environment variables
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker configuration
├── jest.config.js        # Jest configuration
├── migrate-config.js     # Database migration configuration
├── nodemon.json          # Nodemon configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

### Key Components

- **API Layer** (`src/api/`): Contains versioned API endpoints, controllers, and services
- **Core Layer** (`src/core/`): Houses fundamental functionality like database access, middleware, and models
- **Config** (`src/config/`): Application-wide configuration management
- **Utils** (`src/utils/`): Shared utilities and helper functions
- **Tests** (`__tests__/`): Test suites and test utilities
- **Migrations** (`migrations/`): Database schema version control

### Development Tools

- TypeScript configuration via `tsconfig.json`
- ESLint and Prettier for code quality
- Jest for testing
- Nodemon for development server
- Docker support for containerization
- Database migrations with `node-pg-migrate`

This layered architecture promotes:
- Clear separation of concerns
- Version control of API endpoints
- Centralized configuration management
- Modular and maintainable codebase
- Easy testing and deployment

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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