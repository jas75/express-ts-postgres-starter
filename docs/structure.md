# Project Structure

This document explains the organization and structure of the project.

## Directory Structure

```
.
├── src/                    # Source code
│   ├── api/               # REST routes and controllers
│   │   └── v1/           # API version 1
│   │       ├── controllers/  # Request handlers
│   │       ├── services/    # Business logic
│   │       └── routes/      # API route definitions
│   ├── core/              # Business logic
│   ├── utils/             # Utilities
│   ├── config/            # Configuration
│   └── index.ts           # Application entry point
├── __tests__/             # Tests directory
├── migrations/            # Database migrations
├── docs/                  # Documentation
├── dist/                  # Compiled output
└── node_modules/          # Dependencies

```

## Key Components

### `/src`

#### `/api/v1`
- `/controllers`: Handle HTTP requests and responses
- `/services`: Implement business logic and data operations
- `/routes`: Define API endpoints and routing logic

#### `/core`
- Contains business logic
- Transport-independent services
- Data models
- Data access repositories

#### `/utils`
- Reusable utility functions
- Logging configuration
- Error handling
- Validators and helpers

#### `/config`
- Application configuration
- Environment variables
- External services configuration

### `/migrations`
- PostgreSQL migration scripts
- Database versioning
- Table creation and modifications

### `/__tests__`
- Test files
- Test configuration
- Mocks and fixtures

## Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Interfaces**: PascalCase (`UserData`)
- **Types**: PascalCase (`UserType`)
- **Variables/Functions**: camelCase (`getUserById`)

## Configuration Files

- `.env` : Environment variables
- `tsconfig.json` : TypeScript configuration
- `jest.config.js` : Test configuration
- `docker-compose.yml` : Docker configuration
- `nodemon.json` : Development server configuration
- `.eslintrc.json` : Linting rules
- `.prettierrc` : Code formatting rules

## Main Dependencies

- `express` : Web framework
- `typescript` : Programming language
- `pg` : PostgreSQL client
- `jest` : Testing framework

## Best Practices

1. **Modularity**
   - Independent modules
   - Loose coupling
   - High cohesion

2. **Testability**
   - Unit tests per module
   - Mocked dependencies
   - Integration tests for flows

3. **Maintainability**
   - Clear documentation
   - Readable code
   - Consistent structure 