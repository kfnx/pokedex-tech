# Backend Unit Tests

This directory contains unit tests for the Pokédex backend API.

## Test Structure

```
tests/
├── api/              # API integration tests (require running server)
│   ├── health.test.ts
│   └── pokemon.test.ts
├── services/         # Service layer unit tests
│   └── pokeapi.test.ts
├── utils/           # Utility function unit tests
│   └── validation.test.ts
└── helpers/         # Helper and constant tests
    └── constants.test.ts
```

## Running Tests

### All Tests
```bash
bun test
```

### Unit Tests Only (no server required)
```bash
bun test tests/utils/ tests/services/ tests/helpers/
```

### API Integration Tests (requires running server)
```bash
# Start the server first
bun run dev

# In another terminal
bun test tests/api/
```

### Watch Mode
```bash
bun test --watch
```

## Test Coverage

### Unit Tests (39 tests)
- ✅ Validation utilities (27 tests)
- ✅ PokeAPI service (3 tests)
- ✅ Constants and configuration (9 tests)

### Integration Tests (12 tests)
- ⚠️ Health endpoints (4 tests) - requires server
- ⚠️ Pokemon API endpoints (8 tests) - requires server

## Test Categories

### Pure Unit Tests
These tests don't require external dependencies and test isolated functions:
- **Validation functions**: Input validation, pagination, ID parsing
- **Service utilities**: HTTP requests, error handling
- **Constants**: Configuration values, response formats

### Integration Tests
These tests require a running server and test full request/response cycles:
- **Health endpoints**: `/health` and `/health/ready`
- **Pokemon endpoints**: `/api/pokemon`, `/api/pokemon/compare`, `/api/types`

## Writing New Tests

### Pure Unit Tests
```typescript
import { describe, it, expect } from 'bun:test';
import { yourFunction } from '../../src/utils/yourModule';

describe('Your Module', () => {
  it('should handle valid input', () => {
    expect(yourFunction('valid')).toBe('expected');
  });
});
```

### API Integration Tests
```typescript
import { describe, it, expect } from 'bun:test';

describe('Your API Endpoint', () => {
  const BASE_URL = 'http://localhost:3001';

  it('should return expected response', async () => {
    const response = await fetch(`${BASE_URL}/your-endpoint`);
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Isolation**: Unit tests should not depend on external services
2. **Mocking**: Use Bun's built-in `mock()` for external dependencies
3. **Descriptive names**: Test names should clearly describe the scenario
4. **Edge cases**: Test both happy path and error conditions
5. **Fast execution**: Unit tests should run quickly
6. **Deterministic**: Tests should produce consistent results