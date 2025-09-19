# Pokédex Full-Stack Application - Complete Implementation

Build a complete Pokédex application demonstrating full-stack development skills. Create a production-ready application with React Native Web frontend, Node.js backend, and complete DevOps pipeline.

## Project Architecture

```
pokedex-app/
├── frontend/                 # React Native with Expo Web
├── backend/                 # Node.js/Express API
├── database/               # Database schema & migrations
├── tests/                  # E2E and unit tests
├── k8s/                   # Kubernetes manifests
├── .github/workflows/     # CI/CD pipeline
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Core Implementation Requirements

### 1. Frontend (React Native + Expo Web)
**Tech Stack:** React Native, Expo, TypeScript, React Navigation

**Components to Build:**
- `PokemonList` - Grid view with infinite scroll and search
- `PokemonCard` - Individual pokemon display with image, name, types
- `PokemonDetail` - Full pokemon info with stats, abilities, evolution
- `SearchBar` - Real-time search with debouncing
- `FilterPanel` - Type and generation filters
- `CompareView` - Side-by-side pokemon comparison

**Key Features:**
- Responsive design matching reference: https://jordanwhunter.github.io/pokedex/
- Search pokemon by name with auto-suggestions
- Filter by type and generation
- Pokemon detail pages with stats visualization
- Comparison feature for 2-3 pokemon
- Smooth animations and loading states

### 2. Backend API (Node.js/Express)
**Tech Stack:** Node.js, Express, TypeScript, node-postgres

**API Endpoints:**
```
GET /api/pokemon?page=1&limit=20&search=&type=&generation=
GET /api/pokemon/:id
GET /api/pokemon/compare?ids=1,2,3
GET /api/types
GET /api/generations
POST /api/pokemon/sync  # Sync data from PokeAPI
```

**Core Logic:**
- Proxy layer to PokeAPI with intelligent caching
- Database-first approach (check DB → fetch from PokeAPI if missing → store → return)
- Rate limiting and request validation
- Error handling with proper HTTP status codes

### 3. Database Integration
**Use:** Supabase (recommended for simplicity)

**Schema Design:**
```sql
-- Core tables needed
pokemon (id, name, height, weight, base_experience, order, sprites_json)
pokemon_types (pokemon_id, type_id, slot)
pokemon_stats (pokemon_id, stat_id, base_stat, effort)
types (id, name)
stats (id, name)
generations (id, name, region)
```

### 4. DevOps & Deployment
**Containerization:**
- Multi-stage Dockerfile for production optimization
- Docker Compose for local development
- Environment variable management

**Kubernetes Deployment:**
```yaml
# Required manifests
- deployment.yaml (app deployment)
- service.yaml (load balancer)
- configmap.yaml (environment config)
- secret.yaml (database credentials)
```

**CI/CD Pipeline (GitHub Actions):**
```yaml
# Required workflow steps
- Checkout code
- Setup Node.js
- Install dependencies
- Run tests (unit + E2E)
- Build Docker image
- Push to registry
- Deploy to Kubernetes
```

## Specific Implementation Instructions

### Frontend Development
1. **Setup:** `npx create-expo-app --template blank-typescript`
2. **Navigation:** Use React Navigation v6 with stack and tab navigators
3. **State Management:** Use React Query for API calls + React Context for global state
4. **Styling:** Use NativeWind (Tailwind for React Native) or Styled Components
5. **Image Handling:** Implement lazy loading with placeholder images
6. **Performance:** Virtual list for pokemon grid, memoize heavy components

### Backend Development
1. **Project Structure:**
```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── services/      # Business logic
│   ├── models/        # Database models
│   ├── middleware/    # Auth, validation, rate limiting
│   ├── utils/         # Helpers
│   └── routes/        # Express routes
```

2. **Database Layer:** Use connection pooling, prepared statements, transaction handling
3. **Caching Strategy:** Redis for hot data, DB for persistent cache with TTL
4. **PokeAPI Integration:** Implement retry logic, respect rate limits, batch operations

### Testing Implementation
**E2E Tests (Playwright):**
- Search functionality works correctly
- Navigation to pokemon details
- Filter and sort operations
- Comparison feature
- Error states (network failures)

**Unit Tests (Jest):**
- API endpoint testing
- Database query functions
- Utility functions
- Component rendering

### Database Setup
1. **Supabase Project:** Create new project with PostgreSQL
2. **Schema Migration:** Create migration files for all tables
3. **Data Seeding:** Script to populate initial pokemon data from PokeAPI
4. **Indexing:** Add indexes for search and filtering performance

## Production Considerations

### Performance Optimizations
- Image CDN integration (Cloudinary or similar)
- API response caching headers
- Database query optimization with proper indexes
- Frontend bundle optimization and code splitting

### Security Implementation
- Input validation with Joi or Zod
- Rate limiting with express-rate-limit
- CORS configuration
- Environment variable validation
- Container security best practices

### Monitoring & Logging
- Health check endpoints
- Structured logging with Winston
- Error tracking integration ready
- Performance metrics collection points

## Success Criteria

### Must Have (MVP)
✅ React Native app runs on web with Expo
✅ Pokemon list with search and basic filters
✅ Pokemon detail pages with stats
✅ Backend API with database integration
✅ Docker containerization
✅ Basic Kubernetes deployment
✅ CI/CD pipeline with automated testing
✅ Production-ready error handling

### Nice to Have (if time permits)
- Advanced filtering (multiple types, stat ranges)
- Pokemon comparison feature
- Offline capability with service workers
- Advanced caching strategies
- Performance monitoring dashboard

## Deliverables Checklist

- [ ] Complete source code with TypeScript
- [ ] Working React Native Web application
- [ ] RESTful API with proper documentation
- [ ] Database schema with migrations
- [ ] Docker configuration
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] E2E test suite
- [ ] Comprehensive README with setup instructions
- [ ] Architecture documentation

## Quick Start Commands

After implementation, these should work:
```bash
# Local development
docker-compose up -d
npm run dev

# Testing
npm run test
npm run test:e2e

# Production build
docker build -t pokedex-app .
kubectl apply -f k8s/

# CI/CD
git push origin main  # Triggers automated pipeline
```

**Timeline:** 3-4 days for complete implementation
**Focus:** Demonstrate full-stack competency with production-ready code quality over feature completeness.