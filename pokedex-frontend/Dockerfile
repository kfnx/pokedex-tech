# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies needed for Expo and native modules
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Copy package files
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies
# Check if bun.lock exists, if so use bun, otherwise use npm
RUN if [ -f "bun.lock" ]; then \
        npm install -g bun && bun install; \
    else \
        npm ci; \
    fi

# Copy source code
COPY . .

# Create .env file if it doesn't exist
RUN touch .env

# Expose the port that Expo dev server runs on
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Set environment variables
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start the Expo development server
CMD ["npx", "expo", "start", "--host", "tunnel"]