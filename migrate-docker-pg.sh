#!/bin/bash

set -e

echo "Starting database migration process..."

if ! docker compose ps | grep -q "postgres.*Up"; then
    echo "PostgreSQL container is not running. Starting Docker Compose services..."
    docker compose up -d postgres
fi

echo "Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping for 2 seconds..."
  sleep 2
done

echo "PostgreSQL is ready!"

export DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/pokedex"
export DIRECT_URL="postgresql://postgres:postgres123@localhost:5432/pokedex"

echo "Running Prisma database migrations..."
cd pokedex-backend

echo "Generating Prisma client..."
bunx prisma generate

echo "Deploying migrations..."
bunx prisma migrate deploy

echo "✅ Database migrations completed successfully!"

echo "Current migration status:"
bunx prisma migrate status

echo ""
echo "Running Prisma seed to populate initial data..."
bun run prisma/seed.ts

echo "✅ Database seeding completed successfully!"