import { test, expect } from '@playwright/test';

test.describe('Basic Connectivity', () => {
  test('should verify backend is accessible', async ({ request }) => {
    // Test backend health endpoint
    const healthResponse = await request.get('http://localhost:3000/health');
    expect(healthResponse.status()).toBe(200);

    const healthData = await healthResponse.json();
    expect(healthData).toBeDefined();
  });

  test('should verify pokemon API endpoints', async ({ request }) => {
    // Test pokemon list endpoint
    const pokemonResponse = await request.get('http://localhost:3000/api/pokemon');
    expect(pokemonResponse.status()).toBe(200);

    const pokemonData = await pokemonResponse.json();
    expect(pokemonData).toBeDefined();

    // Test individual pokemon endpoint
    const singlePokemonResponse = await request.get('http://localhost:3000/api/pokemon/1');
    expect(singlePokemonResponse.status()).toBe(200);

    const singlePokemonData = await singlePokemonResponse.json();
    expect(singlePokemonData).toBeDefined();
    expect(singlePokemonData.id).toBe(1);
  });

  test('should verify frontend is serving content', async ({ request }) => {
    // Test that frontend is serving content
    const frontendResponse = await request.get('http://localhost:8081/');
    expect(frontendResponse.status()).toBe(200);

    const content = await frontendResponse.text();
    expect(content).toContain('html');
  });
});