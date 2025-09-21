# Pokédex Voltron

A full-stack Pokédex application with React Native frontend, Express.js backend, and comprehensive deployment options.

## 🚀 Quick Start

### Development Setup
```bash
# Start all services (require docker)
docker-compose up -d

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

## 📁 Project Structure

```
pokedex-voltron/
├── pokedex-backend/     # Express.js API (Bun + Prisma + PostgreSQL)
├── pokedex-frontend/    # React Native Expo App
├── e2e/                 # Playwright end-to-end tests
├── k8s/                 # Kubernetes deployment manifests
├── scripts/             # Deployment and utility scripts
└── docker-compose.yml   # Local development environment
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (rate limiting)
- **API**: RESTful with Swagger/OpenAPI docs
- **External**: PokeAPI integration

### Frontend
- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based)
- **Styling**: React Native StyleSheet
- **State**: React hooks with custom data fetching

## 🔧 Development Commands

install bun https://bun.com/docs/installation#installing

### Backend (`pokedex-backend/`)
```bash
bun install          # Install dependencies
bun run dev          # Development server (:3001)
bun run build        # Build application
bun test             # Run unit tests
bunx prisma studio   # Database GUI
```

### Frontend (`pokedex-frontend/`)
```bash
bun install          # Install dependencies
bun start            # Expo development server
bun run web          # Web version (:8081)
bun test             # Run unit tests
bun run lint         # ESLint
```

### E2E Tests (`e2e/`)
```bash
npm install          # Install dependencies
npm test             # Run Playwright tests
npm run test:ui      # Tests with UI
```

## 🐳 Deployment Options

### Docker Compose (Recommended for Development)
```bash
docker-compose up -d                    # Start all services
docker-compose logs -f backend          # View backend logs
docker-compose down                     # Stop services
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
docker-compose -f docker-compose.production.yml up -d
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

### Backend Tests (39 tests)
```bash
cd pokedex-backend
bun test                                # All tests
bun test tests/utils/                   # Utility functions
bun test tests/services/                # Service layer
```

### Frontend Tests (14 tests)
```bash
cd pokedex-frontend
npm test                                # All tests
npx jest __tests__/basic.test.ts        # Core functionality
```

### E2E Tests
```bash
cd e2e
npm test                                # Full user journey tests
npm run test:headed                     # With browser UI
```

## 🔧 Configuration

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
- Backend: `http://localhost:3001` (or `:3000` in Docker)
- Frontend: `http://localhost:8081`
- Database: PostgreSQL on `:5432`
- Cache: Redis on `:6379`

### Docker Compose
- All services containerized
- Automatic health checks
- Persistent data volumes
- Network isolation

### Kubernetes
- Scalable deployment (2 replicas each)
- LoadBalancer services
- Persistent storage for PostgreSQL
- Ingress routing via `pokedex.local`

## 📚 Documentation

- [Backend API Documentation](http://localhost:3000/docs) - Swagger UI
- [Deployment Guide](k8s/README.md) - Kubernetes setup
