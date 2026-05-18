# Use Node.js LTS version
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Accept build argument for API base URL
ARG VITE_API_BASE_URL=/api/v1

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application with environment variable
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]