FROM oven/bun:1 AS base
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
RUN apt-get update -y && apt-get install -y openssl
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Generate Prisma client (this needs a dummy DATABASE_URL)
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN bunx prisma generate

# Copy production dependencies and source code into final image
FROM base AS release
RUN apt-get update -y && apt-get install -y openssl
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/src ./src
COPY --from=prerelease /app/prisma ./prisma
COPY --from=prerelease /app/package.json .
COPY --from=prerelease /app/node_modules/.prisma ./node_modules/.prisma

# Expose port and define the command to run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]