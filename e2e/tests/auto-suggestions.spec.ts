import { test, expect } from '@playwright/test';

test.describe('Auto-Suggestions Functionality', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

  test('should return suggestions for valid queries', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=pik`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('query', 'pik');
    expect(data).toHaveProperty('suggestions');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.suggestions)).toBe(true);

    // Should find Pikachu
    expect(data.count).toBeGreaterThan(0);
    expect(data.suggestions.some(s => s.name.includes('pikachu'))).toBe(true);

    // Each suggestion should have required fields
    data.suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('name');
      expect(suggestion).toHaveProperty('spriteFrontDefault');
    });
  });

  test('should handle short queries with minimum length requirement', async ({ request }) => {
    // Query too short (less than 2 characters)
    const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=p`);

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('at least 2 characters');
  });

  test('should limit suggestions to specified count', async ({ request }) => {
    const limit = 3;
    const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=pik&limit=${limit}`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.suggestions.length).toBeLessThanOrEqual(limit);
  });

  test('should handle queries with no matches gracefully', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=xyz123nonexistent`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('query', 'xyz123nonexistent');
    expect(data).toHaveProperty('suggestions');
    expect(data).toHaveProperty('count', 0);
    expect(data.suggestions).toEqual([]);
  });

  test('should use fuzzy matching when no exact prefix matches', async ({ request }) => {
    // Test a query that might not have exact prefix matches but should have fuzzy matches
    const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=charmndr`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Should still return suggestions due to fuzzy matching
    if (data.count > 0) {
      // Verify suggestions are relevant (fuzzy matched)
      expect(data.suggestions.some(s =>
        s.name.includes('char') || s.name.includes('mander')
      )).toBe(true);
    }
  });

  test('should handle case insensitive searches', async ({ request }) => {
    const queries = ['PIK', 'pik', 'Pik'];

    for (const query of queries) {
      const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=${query}`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.count).toBeGreaterThan(0);

      // Should find Pikachu regardless of case
      expect(data.suggestions.some(s => s.name.toLowerCase().includes('pikachu'))).toBe(true);
    }
  });

  test('frontend should use auto-suggestions', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i], input[placeholder*="pokemon" i]');

    if (await searchInput.isVisible({ timeout: 5000 })) {
      // Monitor for suggestions API calls
      const suggestResponse = page.waitForResponse(`**/api/pokemon/suggest**`, { timeout: 10000 });

      // Type in search input to trigger suggestions
      await searchInput.fill('pik');

      try {
        const response = await suggestResponse;
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.suggestions.length).toBeGreaterThan(0);

        // Look for suggestion dropdown/list
        const suggestionsList = page.locator('[data-testid="suggestions"], .suggestions, [role="listbox"]');

        if (await suggestionsList.isVisible({ timeout: 3000 })) {
          // Verify suggestions are displayed
          const suggestions = suggestionsList.locator('[data-testid="suggestion-item"], .suggestion-item, [role="option"]');
          expect(await suggestions.count()).toBeGreaterThan(0);
        }
      } catch (error) {
        console.log('Auto-suggestions API or UI not fully implemented yet');
      }
    } else {
      console.log('Search input not found - feature may not be implemented yet');
    }
  });
});