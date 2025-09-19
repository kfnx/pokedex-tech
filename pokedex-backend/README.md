# Pokédex Backend

REST API for Pokémon data with database caching and PokeAPI integration.

## Setup

Install bun https://bun.com/docs/installation#installing

1. Install dependencies:
```bash
bun install
```

2. Set up your database URL in `.env`:
```bash
cp .env.example .env
# Edit .env with your Supabase connection strings
```

3. Run database migration:
```bash
bunx prisma migrate dev
```

4. Start the server:
```bash
bun run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Pokémon
- `GET /api/pokemon` - List Pokémon (pagination, filtering, sorting)
- `GET /api/pokemon/:id` - Get Pokémon details
- `GET /api/pokemon/search?q=pikachu` - Search Pokémon
- `GET /api/pokemon/compare?ids=1,25,150` - Compare Pokémon
- `GET /api/pokemon/:id/fetch` - Fetch specific Pokémon from PokeAPI

### Reference Data
- `GET /api/types` - List all types
- `GET /api/abilities` - List abilities

### Admin
- `POST /api/seed` - Seed database with Pokémon data

### Health Checks
- `GET /health` - Basic health check with database connectivity
- `GET /health/ready` - Readiness check (database + data seeded)

## Query Parameters

### `/api/pokemon`
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `search` - Filter by name
- `type` - Filter by type name
- `generation` - Filter by generation number
- `sort` - Sort by: id, name, height, weight (default: id)

### `/api/seed` (POST)
- `count` - Number of Pokémon to seed (default: 151, max: 1000)

## Database

Uses PostgreSQL with Prisma ORM. Schema includes:
- Pokemon with stats, types, abilities, moves
- Species data with evolution chains
- Reference tables for types, abilities, moves

## Docker

### Using Docker Compose (Recommended)

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker directly

```bash
# Build image
docker build -t pokedex-backend .

# Run container
docker run -d -p 3000:3000 --env-file .env --name pokedex-api pokedex-backend

# View logs
docker logs -f pokedex-api
```

## Stack

- Bun runtime
- Express + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
