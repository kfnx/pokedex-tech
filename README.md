# Pokédex Voltron

A full-stack Pokédex application with React Native frontend, Express.js backend, and comprehensive deployment options.

## Quick Start

### Development Setup

Make sure you have docker and bun installed. https://bun.com/docs/installation#installing

```bash
# Start all services (require docker)
docker compose up -d

# run migration and seed
migrate-docker-pg.sh

# Access the application
Frontend: http://localhost:8081
Backend API Docs: http://localhost:3000/docs
```

### Manual Development
```bash
# Backend
cd pokedex-backend && bun install && bun run dev

# Frontend
cd pokedex-frontend && npm install && npm start

# E2E Tests
cd e2e && npm install && npm test
```

## Project Structure

```
pokedex-voltron/
├── pokedex-backend/     # Express.js API (Bun + Prisma + PostgreSQL)
├── pokedex-frontend/    # React Native Expo App
├── e2e/                 # Playwright end-to-end tests
├── k8s/                 # Kubernetes deployment manifests
├── scripts/             # Deployment and utility scripts
└── docker-compose.yml   # Local development environment
```

## Technology Stack

### Backend
- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (rate limiting)
- **Docs**: Swagger/OpenAPI docs

### Frontend
- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based)
- **Styling**: React Native StyleSheet

## Development Commands

install bun https://bun.com/docs/installation#installing

### Backend (`pokedex-backend/`)
```bash
bun install          # Install dependencies
bun prisma generate  # Generate prisma client
bun prisma migrate   # Execute migration
bun prisma seed      # seed pokemon data in postgres
bun run dev          # Development server (:3000)
bun run build        # Build application
bun test             # Run unit tests
bun typecheck        # Check typescript errors
bun lint             # ESLint
bun prisma studio    # Database GUI
```

### Frontend (`pokedex-frontend/`)
```bash
bun install          # Install dependencies
bun start            # Expo development server
bun run web          # Web version (:8081)
bun test             # Run unit tests
bun typecheck        # Check typescript errors
bun lint             # ESLint
```

### E2E Tests (`e2e/`)

```bash
# make sure postgres and redis running, migration executed, seed generated
docker compose up postgres redis -d
./migrate-docker-pg.sh

npm install          # Install dependencies
npm test             # Run Playwright tests (require postgres and redis up -> docker compose up postgres redis -d)
npm test:docker      # Run Playwright tests
npm run test:ui      # Tests with UI
```

## Deployment Options

### Docker Compose (Recommended for Development)
```bash
docker compose up -d                    # Start all services
docker compose logs -f backend          # View backend logs
docker compose down                     # Stop services
```

### Kubernetes
```bash
cd k8s
./deploy.sh                             # Deploy to cluster
kubectl get pods -n pokedex             # Check status
./cleanup.sh                           # Remove deployment
```

### Production
```bash
docker compose -f docker-compose.production.yml up -d
```

## 📋 API Endpoints

### Core Endpoints
- `GET /api/pokemon` - Paginated Pokemon list with filtering
- `GET /api/pokemon/:id` - Individual Pokemon details
- `GET /api/pokemon/search` - Search Pokemon by name/type
- `GET /api/pokemon/compare` - Compare up to 6 Pokemon
- `GET /api/types` - Pokemon types list

### System Endpoints
- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /docs` - Swagger API documentation
- `POST /api/seed` - Populate database from PokeAPI

## 🧪 Testing

### Services check
```bash
node test-service.js
```

### Backend Unit Tests (require database and backend service running)
```bash
cd pokedex-backend
bun test
```

### Frontend Unit Tests
```bash
cd pokedex-frontend
bun test
```

### E2E Tests
```bash
cd e2e
bun run test
```

## CI / CD

<img src="https://github.com/kfnx/pokedex-tech/blob/main/cicd.png?raw=true" />

github workflows:
- Lint and Typecheck
- Unit Test
- E2E test with Playwright
- Deploy

## Configuration

### Environment Variables

**Backend** (`.env`):
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/pokedex"
DIRECT_URL="postgresql://user:pass@localhost:5432/pokedex"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
PORT="3000"
```

**Frontend** (`.env`):
```bash
BACKEND_API_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Setup
```bash
cd pokedex-backend
bunx prisma migrate dev
bunx prisma seed
bunx prisma generate
```

## 🚀 Deployment Environments

### Local Development
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8081`
- Database: PostgreSQL on `:5432`
- Cache: Redis on `:6379`

### Kubernetes
- Scalable deployment (2 replicas each)
- LoadBalancer services
- Persistent storage for PostgreSQL
- Ingress routing via `pokedex.local`

## 📚 Documentation

- [Backend API Documentation](http://localhost:3000/docs) - Swagger UI
- [Deployment Guide](k8s/README.md) - Kubernetes setup
