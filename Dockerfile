# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source files and built files
COPY src/ ./src/
COPY --from=builder /app/dist ./dist

# Copy migrations
COPY migrations ./migrations
COPY migrate-config.js ./

# Copy init script
COPY scripts/init.sh ./init.sh
RUN chmod +x ./init.sh

# Copy necessary files
COPY .env.prod ./.env

# Set environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Start the application with migrations
CMD ["./init.sh"] 