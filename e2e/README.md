# E2E Testing Setup

This folder contains end-to-end tests for the Pokedex application using Playwright.

## Prerequisites

- Backend server running on port 3000
- Frontend web server running on port 8081
- Bun installed

## Setup

1. Install dependencies:
```bash
bun install
```

2. Install Playwright browsers (if needed):
```bash
bunx playwright install
```

## Running Tests

```bash
# Run all tests
bun test

# Run tests with UI mode
bun run test:ui

# Run tests in headed mode (see browser)
bun run test:headed

# Debug tests
bun run test:debug

# View test report
bun run report
```

## Configuration

The Playwright configuration is in `playwright.config.ts` and includes:
- Automatic startup of backend and frontend servers
- Base URL configuration
- Browser setup (Chrome by default)
- Test directory: `./tests`

## Test Structure

- `tests/pokemon-listing.spec.ts` - Basic tests for Pokemon listing functionality

The tests assume your frontend uses data-testid attributes for reliable element selection. Consider adding these to your components for better test stability.