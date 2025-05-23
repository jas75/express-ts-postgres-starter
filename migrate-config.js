// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// Define variables explicitly to ensure they're strings
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const user = process.env.DB_USER || 'postgres';
// TODO: Remove this postgress password
const password = process.env.DB_PASSWORD || 'postgres';
const database = process.env.DB_NAME || 'api_db';

// Log connection details for debugging
console.log('Database connection details:');
console.log(`Host: ${host}, Port: ${port}, User: ${user}, Database: ${database}`);

// Construct URL manually
const pgUrl = `postgres://${user}:${password}@${host}:${port}/${database}`;

module.exports = {
  connectionString: pgUrl,
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
};
