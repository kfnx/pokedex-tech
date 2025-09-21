FROM oven/bun:1-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN bunx prisma generate

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run curl -f http://localhost:3000/health || exit 1

# Run database migrations and start the server
CMD ["bun", "run", "start"]