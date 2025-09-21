# Build stage - Use Node for Expo compatibility
FROM node:22-alpine AS builder

WORKDIR /app

# Install Bun globally for package management (specific version for stability)
RUN npm install -g bun@1.1.38

# Copy package files and lock file
COPY package.json bun.lock ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the Expo web app using npx (Metro needs Node runtime)
RUN npx expo export --platform web

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]