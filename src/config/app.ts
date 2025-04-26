import 'dotenv/config';

export const config = {
  app: {
    name: 'express-ts-postgres-api',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiPrefix: process.env.API_PREFIX || '/api',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'api_db',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    debug: process.env.DB_DEBUG === 'true',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  },
  rateLimiter: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.LOG_TO_FILE === 'true',
    requestLogging: process.env.LOG_REQUESTS !== 'false',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    route: process.env.SWAGGER_ROUTE || '/api-docs',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // seconds
    enabled: process.env.CACHE_ENABLED === 'true',
  },
};
