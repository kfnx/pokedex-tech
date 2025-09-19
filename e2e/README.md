# E2E Testing Guide

This directory contains end-to-end tests for the Pokédex application using Playwright.

## Prerequisites

1. **System Dependencies**: Install Playwright browser dependencies:
   ```bash
   sudo npx playwright install-deps
   npx playwright install
   ```

2. **Running Services**: Ensure both frontend and backend are running:
   ```bash
   # Option 1: Using Docker Compose (recommended)
   docker-compose up -d

   # Option 2: Manual start
   # Terminal 1: Backend
   cd pokedex-backend && bun run dev

   # Terminal 2: Frontend
   cd pokedex-frontend && npm run web
   ```

## Test Suites

### Basic Connectivity (`basic-connectivity.spec.ts`)
- Tests API endpoints are accessible
- Verifies frontend is serving content
- No browser dependencies - uses request API only

### App Health (`app-health.spec.ts`)
- Tests homepage loads successfully
- Verifies backend health endpoints
- Tests 404 page handling

### Pokemon Listing (`pokemon-listing.spec.ts`)
- Tests pokemon content display
- Verifies routing to detail pages
- Monitors API calls

### Navigation (`pokemon-navigation.spec.ts`)
- Tests tab navigation
- Verifies pokemon detail page routing
- Tests navigation from home to detail

### API Integration (`api-integration.spec.ts`)
- Tests API data loading
- Tests error handling
- Verifies multiple endpoints

### Search Functionality (`search-functionality.spec.ts`)
- Tests search/explore page
- Verifies search input functionality
- Tests search API integration

## Running Tests

### With Docker (Recommended)
```bash
# Start services with Docker Compose
docker-compose up -d

# Run tests
cd e2e
npm run test:docker
```

### Without Docker
```bash
# Start backend and frontend manually
cd pokedex-backend && bun run dev &
cd pokedex-frontend && npm run web &

# Run tests
cd e2e
npm test
```

### Test Options
```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Run specific test file
npx playwright test tests/basic-connectivity.spec.ts

# Generate test report
npm run report
```

## Configuration

- **Base URL**: Tests run against `http://localhost:8081` (frontend)
- **API URL**: Backend expected at `http://localhost:3000`
- **Browser**: Chrome/Chromium by default
- **Retries**: 2 retries in CI, 0 locally
- **Timeout**: 30 seconds per test, 10 seconds for assertions

## Troubleshooting

### Browser Dependencies Missing
If you see browser dependency errors:
```bash
sudo npx playwright install-deps
```

### Services Not Running
Ensure both frontend (8081) and backend (3000) are accessible:
```bash
curl http://localhost:3000/health
curl http://localhost:8081/
```

### Test Failures
1. Check that database migrations have been run
2. Verify API endpoints return expected data
3. Use `--headed` mode to see browser interactions
4. Check browser console for JavaScript errors

## Test Strategy

The test suite follows a layered approach:

1. **Connectivity Tests**: Basic API and service availability
2. **Functional Tests**: Core app functionality and navigation
3. **Integration Tests**: End-to-end user workflows
4. **Edge Cases**: Error handling and edge scenarios

Tests are designed to be:
- **Resilient**: Use flexible selectors and fallbacks
- **Independent**: Each test can run in isolation
- **Fast**: Minimal setup and focused assertions
- **Maintainable**: Clear structure and good documentation