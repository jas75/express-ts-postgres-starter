# Installation Guide

This guide explains how to install and configure the project for development and production.

## Prerequisites

Before starting, make sure you have installed:
- Node.js (version 18 or higher)
- Docker and Docker Compose
- Git
- PostgreSQL (for local installation)

## Installation with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd express-ts-postgres-starter
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Modify the variables in `.env` according to your needs

3. **Launch with Docker**
   ```bash
   # Build and start containers
   docker-compose up -d

   # Check logs
   docker-compose logs -f
   ```

4. **Database Migrations**
   ```bash
   # Inside the container
   docker-compose exec app npm run migrate:up
   ```

## Local Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <repo-url>
   cd express-ts-postgres-starter
   npm install
   ```

2. **PostgreSQL Configuration**
   - Create a PostgreSQL database
   - Configure environment variables in `.env`

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Modify the variables according to your local configuration

4. **Database Migrations**
   ```bash
   npm run migrate:up
   ```

5. **Start the Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Environment Variables

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Logging
LOG_LEVEL=debug

# API
API_PREFIX=/api
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## Verifying the Installation

1. **API Health**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Swagger Documentation**
   Open `http://localhost:3000/api-docs` in your browser

3. **Tests**
   ```bash
   # All tests
   npm test

   # Specific tests
   npm run test:unit
   npm run test:integration
   npm run test:e2e
   ```

## Common Issues

### Database Connection Error
- Verify that PostgreSQL is running
- Check connection information in `.env`
- Make sure the database exists

### Port Errors
- Check that no other service is using port 3000
- Modify the PORT in `.env` if necessary

### Docker Permission Issues
- Make sure you have sufficient permissions
- Use `sudo` if necessary (Linux/Mac)

## Support

If you encounter problems:
1. Check the logs (`npm run logs` or `docker-compose logs`)
2. Check the documentation
3. Open an issue on GitHub 