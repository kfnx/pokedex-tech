### Backend Stack
- REST API (Node.js/Express.js)
- Database integration with caching strategy
- Prisma ORM and migration
- Supabase PostgreSQL database
- Proxy layer to PokeAPI

### Data Flow Strategy
The application should implement a database-first caching approach:

1. Client requests Pokémon data
2. API checks local database for existing data
3. If data exists and is fresh, return cached version
4. If data is missing or stale, fetch from PokeAPI
5. Store/update data in database before returning to client
6. Implement appropriate cache invalidation strategies

### API Design
Design a RESTful API with the following endpoints:

- GET /api/pokemon - List Pokémon with pagination and filters
- GET /api/pokemon/:id - Get specific Pokémon details
- GET /api/pokemon/search - Search functionality
- GET /api/pokemon/compare - Compare multiple Pokémon
- Additional endpoints as needed for types, generations, etc.

### Database Schema
Design an efficient schema to store:
- Pokémon basic information
- Stats and abilities
- Type relationships
- Sprite URLs and image data
- Metadata for cache management

### Database Integration
- Use managed database service (Supabase)
- Implement proper connection pooling (Check if it is already handled by Supabase)
- Database migration strategy

### Code Organization
- Feature-based folder structure
- Separation of concerns
- Reusable utility functions
- Consistent coding standards

### Containerization
- Create production-ready Dockerfile
- Optimize image size and security
- Include proper health checks
- Environment variable management