# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `bun install` - Install dependencies
- `bun run dev` - Start development server (http://localhost:3000)
- `bun run build` - Build the application
- `bun run start` - Run production server
- `bun run start:compiled` - Run compiled production build

### Database Commands
- `bunx prisma migrate dev` - Run database migrations in development
- `bunx prisma db pull` - Pull database schema changes
- `bunx prisma generate` - Generate Prisma client
- `bunx prisma studio` - Open Prisma Studio for database GUI

### Docker Commands
- `docker-compose up -d` - Start in background
- `docker-compose logs -f` - View logs
- `docker-compose down` - Stop services

## Architecture Overview

This is a REST API backend for a Pokédex application built with:
- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **External API**: PokeAPI integration with intelligent caching

### Key Components

**Main Entry Point** (`src/index.ts`):
- Express server with CORS configured for Expo frontend
- Health check endpoints (`/health`, `/health/ready`)
- RESTful API routes for Pokémon data

**PokeAPI Service** (`src/services/pokeapi.ts`):
- Handles fetching from external PokeAPI
- Implements caching strategy with different durations:
  - Pokemon details: 24 hours
  - Pokemon list: 1 hour
  - Types/Stats: 7 days
- Smart cache invalidation and refresh logic
- Bulk seeding functionality

**Database Schema** (`prisma/schema.prisma`):
- Comprehensive Pokémon data model with relationships
- Junction tables for many-to-many relationships (types, abilities, stats, moves)
- Includes species data and evolution chains
- Timestamps and cache tracking fields

### Data Flow
1. API requests check local PostgreSQL cache first
2. If cache miss or stale, fetch from PokeAPI
3. Store/update in database with timestamp
4. Return enriched data with relationships

### Key API Patterns
- Pagination with `page`, `limit` parameters
- Filtering by `search`, `type`, `generation`
- Sorting by `id`, `name`, `height`, `weight`
- Compare endpoint supports up to 3 Pokémon
- Force refresh with `?refresh=true` parameter

### Environment Setup
- Copy `.env.example` to `.env`
- Configure `DATABASE_URL` and `DIRECT_URL` for Supabase
- Run migrations before first use
- Use `/api/seed` endpoint to populate initial data