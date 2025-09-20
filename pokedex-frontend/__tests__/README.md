# Frontend Unit Tests

This directory contains basic unit tests for the Pokédex React Native frontend.

## Test Structure

```
__tests__/
├── basic.test.ts        # Core functionality and utilities (14 tests) ✅
├── services/            # API service tests (complex dependency setup needed)
├── hooks/              # React hook tests (complex dependency setup needed)
└── utils/              # Helper function tests (basic tests working)
```

## Running Tests

### All Tests
```bash
npm test
```

### Basic Tests Only (recommended)
```bash
npx jest __tests__/basic.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

### ✅ Working Tests (14 tests)
- **Environment & Configuration**: Node.js environment, JavaScript operations
- **API URL Configuration**: URL construction, query parameters
- **Data Structure Validation**: Pokemon objects, pagination metadata
- **Error Handling**: Error objects, API error responses
- **Utility Functions**: Name formatting, ID validation, timeout handling

### ⚠️ Complex Dependencies (Setup needed)
- **API Service Tests**: Require proper mocking of fetch and React Native modules
- **Hook Tests**: Need React Testing Library with proper React Native setup
- **Component Tests**: Require full React Native testing environment

## Configuration

### Current Setup
- **Framework**: Jest with ts-jest for TypeScript support
- **Environment**: Node.js (simpler than React Native environment)
- **Dependencies**: Minimal setup avoiding complex React Native mocking

### Test Files
- `jest.config.js`: Jest configuration with TypeScript support
- `jest.setup.js`: Mock setup for Expo modules (minimal)
- `package.json`: Test scripts and dependencies

## Writing Tests

### Basic Unit Tests (Recommended)
```typescript
describe('Your Feature', () => {
  it('should handle basic operations', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });
});
```

### API Service Tests (Advanced)
```typescript
// Requires proper fetch mocking
global.fetch = jest.fn();
// ... complex setup needed
```

## Best Practices

1. **Start Simple**: Use basic.test.ts pattern for core logic
2. **Mock External Dependencies**: Avoid complex React Native/Expo setup
3. **Test Business Logic**: Focus on data transformation and validation
4. **Avoid Component Testing**: Use E2E tests for full component behavior
5. **Fast Execution**: Keep tests lightweight and fast

## Current Limitations

- React Native Testing Library setup is complex due to dependency conflicts
- Expo modules require extensive mocking
- Component testing needs full React Native environment
- Focus on business logic and utility function testing for now

## Future Improvements

1. Resolve React Native testing dependencies
2. Add proper API service mocking
3. Implement hook testing with React Testing Library
4. Add component snapshot testing
5. Increase coverage of business logic functions

For now, the basic tests provide good coverage of core functionality and data validation logic.