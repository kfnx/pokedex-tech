# Build stage - Use Node with Bun for consistent dependency resolution
FROM node:22-alpine AS builder

WORKDIR /app

# Install Bun binary directly (more reliable than npm install)
RUN apk add --no-cache bash curl unzip && \
    curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Copy package files and lock file
COPY package.json bun.lock* ./

# Install dependencies using Bun (faster and matches development)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Accept BACKEND_API_URL as build argument and set as ENV for the build
# Expo requires EXPO_PUBLIC_ prefix for client-side environment variables
ARG BACKEND_API_URL=""
ENV EXPO_PUBLIC_BACKEND_API_URL=${BACKEND_API_URL}

# Build the Expo web app using npx (Metro needs Node runtime)
RUN npx expo export --platform web

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8081
EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]