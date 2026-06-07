# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code and shared utilities
COPY backend .
COPY shared ./shared

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]