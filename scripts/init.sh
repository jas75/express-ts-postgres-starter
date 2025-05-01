#!/bin/sh
set -e

# Construct database URL
export DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}"
echo "Database URL: ${DATABASE_URL}"

echo "Waiting for database connection..."
until PGPASSWORD="${DB_PASSWORD}" psql -h "db" -U "${DB_USER}" -d "${DB_NAME}" -c '\q' 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database connection successful!"

echo "Running migrations..."
cd /app
NODE_ENV=production DATABASE_URL="${DATABASE_URL}" npm run migrate:up

echo "Starting application..."
npm start 