FROM node:20-alpine

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Development mode
FROM node:20-alpine AS development
WORKDIR /app
# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++
COPY --from=0 /app .
CMD ["npm", "run", "dev"]

# Production mode
FROM node:20-alpine AS production
WORKDIR /app
# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++
COPY --from=0 /app/package*.json ./
COPY --from=0 /app/dist ./dist
RUN npm ci --only=production
CMD ["node", "dist/index.js"]