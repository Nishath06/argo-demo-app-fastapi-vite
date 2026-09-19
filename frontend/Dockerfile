# Stage 1: Build stage with Node 22 Alpine
FROM node:22-alpine AS builder

WORKDIR /app

# Set build argument for backend API URL with fallback
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies first for efficient caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy source files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Runtime stage with Nginx Alpine
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
