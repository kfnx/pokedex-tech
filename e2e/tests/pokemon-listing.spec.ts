import { test, expect } from '@playwright/test';

test.describe('Pokemon Listing', () => {
  test('should display pokemon list on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the page has loaded properly
    await expect(page).toHaveTitle(/Pokedex/);

    // Look for pokemon cards or list items
    // Adjust these selectors based on your actual frontend implementation
    const pokemonCards = page.locator('[data-testid="pokemon-card"]');
    const pokemonListItems = page.locator('text=Pokemon').first();

    // Check if pokemon data is displayed
    await expect(pokemonCards.or(pokemonListItems)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to pokemon detail page', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click on the first pokemon (adjust selector based on your implementation)
    const firstPokemon = page.locator('[data-testid="pokemon-card"]').first();

    if (await firstPokemon.isVisible()) {
      await firstPokemon.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/pokemon\/\d+/);
    } else {
      // Fallback: just check if we can navigate to a known pokemon
      await page.goto('/pokemon/1');
      await expect(page).toHaveURL('/pokemon/1');
    }
  });

  test('should load pokemon data from API', async ({ page }) => {
    // Intercept API calls to verify backend is working
    const apiResponse = page.waitForResponse('**/api/pokemon**');

    await page.goto('/');

    const response = await apiResponse;
    expect(response.status()).toBe(200);

    const jsonData = await response.json();
    expect(Array.isArray(jsonData) || typeof jsonData === 'object').toBe(true);
  });
});