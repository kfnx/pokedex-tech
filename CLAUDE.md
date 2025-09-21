# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Expo React Native)
- `cd pokedex-frontend && bun install` - Install frontend dependencies
- `cd pokedex-frontend && bun start` - Start Expo development server
- `cd pokedex-frontend && bun run web` - Run web version
- `cd pokedex-frontend && bun run android` - Run Android version
- `cd pokedex-frontend && bun run ios` - Run iOS version
- `cd pokedex-frontend && bun run lint` - Run ESLint

### Backend (Express.js + Bun)
- `cd pokedex-backend && bun install` - Install backend dependencies
- `cd pokedex-backend && bun run dev` - Start development server (http://localhost:3000)
- `cd pokedex-backend && bun run build` - Build the application
- `cd pokedex-backend && bun run start` - Run production server

### Backend Database (Prisma + PostgreSQL)
- `cd pokedex-backend && npx prisma migrate dev` - Run database migrations
- `cd pokedex-backend && npx prisma generate` - Generate Prisma client
- `cd pokedex-backend && npx prisma studio` - Open database GUI

### End-to-End Testing (Playwright)
- `cd e2e && npm install` - Install e2e dependencies
- `cd e2e && npm test` - Run Playwright tests
- `cd e2e && npm run test:ui` - Run tests with UI
- `cd e2e && npm run test:headed` - Run tests in headed mode

## Architecture Overview

This is a full-stack Pokédex application with React Native (Expo) frontend, Express.js backend, and PostgreSQL database.

### Project Structure
```
pokedex-voltron/
├── pokedex-frontend/    # React Native (Expo) app
├── pokedex-backend/     # Express.js API server
└── e2e/                # Playwright end-to-end tests
```

### Frontend Architecture (React Native + Expo)
- **Framework**: Expo Router with file-based routing
- **UI**: Custom themed components with dark/light mode support
- **State Management**: React hooks with custom data fetching hooks
- **Responsive Design**: Adaptive grid layout (1-3 columns based on screen size)
- **Key Features**: Infinite scroll, pull-to-refresh, skeleton loading

### Backend Architecture (Express.js + Node.js + Prisma)
- **Runtime**: Node.js with TypeScript
- **API Layer**: Express.js with CORS configured for Expo
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Caching Strategy**: Intelligent cache with different TTLs:
  - Pokemon details: 24 hours
  - Pokemon list: 1 hour
  - Types/Stats: 7 days
- **External API**: PokeAPI integration with bulk seeding

### Key Components

**Frontend Navigation** (`pokedex-frontend/app/`):
- `(tabs)/index.tsx` - Home screen with infinite Pokemon list
- `(tabs)/explore.tsx` - Search and filter functionality
- `(tabs)/compare.tsx` - Pokemon comparison feature
- `pokemon/[id].tsx` - Individual Pokemon detail page with tabbed interface

**Frontend Hooks** (`pokedex-frontend/hooks/`):
- `use-pokemon.ts` - Data fetching with infinite scroll and caching
- `use-color-scheme.ts` - Theme management for dark/light modes

**Backend API Routes** (`pokedex-backend/src/index.ts`):
- `GET /api/pokemon` - Paginated list with search, type, generation filters
- `GET /api/pokemon/:id` - Individual Pokemon details with full relationships
- `GET /api/pokemon/search` - Text search across names, types, abilities
- `GET /api/pokemon/compare` - Compare up to 3 Pokemon side-by-side
- `POST /api/seed` - Bulk seed database from PokeAPI

**Database Schema** (`pokedex-backend/prisma/schema.prisma`):
- Comprehensive Pokemon data model with junction tables
- Many-to-many relationships for types, abilities, stats, moves
- Species data and evolution chains
- Cache timestamp tracking for intelligent refresh

### Data Flow
1. Frontend makes API requests to Express backend
2. Backend checks PostgreSQL cache with timestamp validation
3. If stale/missing, fetch from PokeAPI and update database
4. Return enriched data with full relationships to frontend
5. Frontend caches responses and implements optimistic updates

### Development Patterns
- **API Responses**: Consistent pagination format with meta information
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Image optimization with expo-image, skeleton loading states
- **Accessibility**: Proper semantic markup and navigation patterns

### Environment Setup
- Backend requires `.env` with `DATABASE_URL` and `DIRECT_URL` for Supabase
- Frontend uses `BACKEND_API_URL` to configure backend connection
- E2E tests automatically start both frontend and backend servers

### Testing Strategy
- **E2E Tests**: Playwright configured to test against live frontend/backend
- **Development Flow**: Use `/health` and `/health/ready` endpoints to verify setup
- **Data Seeding**: Use `/api/seed` endpoint to populate database before testing