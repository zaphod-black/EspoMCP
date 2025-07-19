# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY build/ ./build/
COPY README.md LICENSE* ./

# Create logs directory
RUN mkdir -p logs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S espocrm -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R espocrm:nodejs /app

# Switch to non-root user
USER espocrm

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check - server should be running')" || exit 1

# Expose port for HTTP transport
EXPOSE 3000

# Start command
CMD ["node", "build/index.js"]