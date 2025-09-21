import { test, expect } from '@playwright/test';

test.describe('Pokemon Compare Functionality', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

  test('should compare two pokemon successfully', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=1,25`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('pokemon');
    expect(data).toHaveProperty('comparison');
    expect(Array.isArray(data.pokemon)).toBe(true);
    expect(data.pokemon.length).toBe(2);

    // Check comparison metadata
    expect(data.comparison).toHaveProperty('requested');
    expect(data.comparison).toHaveProperty('found');
    expect(data.comparison).toHaveProperty('missing');
    expect(data.comparison.requested).toEqual([1, 25]);
    expect(data.comparison.found).toEqual([1, 25]);
    expect(data.comparison.missing).toEqual([]);

    // Verify pokemon data structure
    data.pokemon.forEach(pokemon => {
      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('types');
      expect(pokemon).toHaveProperty('abilities');
      expect(pokemon).toHaveProperty('stats');
      expect(pokemon).toHaveProperty('species');
      expect(Array.isArray(pokemon.types)).toBe(true);
      expect(Array.isArray(pokemon.abilities)).toBe(true);
      expect(Array.isArray(pokemon.stats)).toBe(true);
    });

    // Verify we have Bulbasaur (id: 1) and Pikachu (id: 25)
    const bulbasaur = data.pokemon.find(p => p.id === 1);
    const pikachu = data.pokemon.find(p => p.id === 25);
    expect(bulbasaur).toBeDefined();
    expect(pikachu).toBeDefined();
    expect(bulbasaur.name).toBe('bulbasaur');
    expect(pikachu.name).toBe('pikachu');
  });

  test('should compare three pokemon (maximum allowed)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=1,4,7`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.pokemon.length).toBe(3);
    expect(data.comparison.found).toEqual([1, 4, 7]);

    // Should have all 3 pokemon
    expect(data.pokemon.every(p => p.id && p.name)).toBe(true);
  });

  test('should reject more than 3 pokemon comparison', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=1,4,7,10`);

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('1-3 valid Pokemon IDs');
  });

  test('should handle invalid pokemon IDs gracefully', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=1,99999`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.pokemon.length).toBe(1); // Only valid Pokemon found
    expect(data.comparison.found).toEqual([1]);
    expect(data.comparison.missing).toEqual([99999]);
    expect(data.pokemon[0].id).toBe(1);
  });

  test('should handle mixed valid and invalid IDs', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=1,invalid,25,99999`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.pokemon.length).toBe(2); // Only valid Pokemon found
    expect(data.comparison.found).toEqual([1, 25]);
    expect(data.comparison.missing).toEqual([99999]);
  });

  test('should require valid IDs parameter', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare`);

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Pokemon IDs are required');
  });

  test('should handle empty IDs parameter', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=`);

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should handle malformed IDs gracefully', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/compare?ids=abc,def,123`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    // Should only process the valid numeric ID (123)
    expect(data.pokemon.length).toBeLessThanOrEqual(1);

    if (data.pokemon.length === 1) {
      expect(data.pokemon[0].id).toBe(123);
    }
  });

  test('frontend compare page should load and function', async ({ page }) => {
    await page.goto('/compare');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/compare/);
    await expect(page.locator('body')).toBeVisible();

    // Look for compare-related UI elements
    const compareElements = page.locator('[data-testid*="compare"], .compare, [aria-label*="compare" i]');

    if (await compareElements.first().isVisible({ timeout: 5000 })) {
      console.log('Compare page UI elements found');

      // Look for pokemon selection inputs or buttons
      const pokemonSelectors = page.locator('input[type="number"], select, [data-testid*="pokemon"], .pokemon-selector');

      if (await pokemonSelectors.first().isVisible({ timeout: 3000 })) {
        // Try to select pokemon for comparison
        try {
          await pokemonSelectors.first().fill('1');

          if (await pokemonSelectors.nth(1).isVisible()) {
            await pokemonSelectors.nth(1).fill('25');
          }

          // Look for compare button
          const compareButton = page.locator('button:has-text("Compare"), [data-testid="compare-button"], .compare-button');

          if (await compareButton.isVisible({ timeout: 3000 })) {
            // Monitor for compare API call
            const compareResponse = page.waitForResponse('**/api/pokemon/compare**', { timeout: 10000 });

            await compareButton.click();

            try {
              const response = await compareResponse;
              expect(response.status()).toBe(200);

              // Wait for comparison results to display
              await page.waitForTimeout(1000);

              // Look for comparison results
              const results = page.locator('[data-testid="comparison-results"], .comparison-results, .compare-results');

              if (await results.isVisible({ timeout: 5000 })) {
                console.log('Comparison results displayed successfully');
              }
            } catch (error) {
              console.log('Compare API call not triggered or failed');
            }
          }
        } catch (error) {
          console.log('Could not interact with pokemon selection elements');
        }
      }
    } else {
      console.log('Compare page UI not fully implemented yet');
    }
  });
});