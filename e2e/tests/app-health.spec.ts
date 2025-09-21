import { test, expect } from '@playwright/test';

test.describe('App Health Check', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page loads without errors
    await expect(page).toHaveTitle(/Pokedex|Pokemon/i);

    // Check for basic UI elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working backend API', async ({ page }) => {
    // Check backend health endpoint
    const healthResponse = await page.request.get('http://localhost:3000/health');
    expect(healthResponse.status()).toBe(200);

    // Check pokemon API endpoint
    const pokemonResponse = await page.request.get('http://localhost:3000/api/pokemon');
    expect(pokemonResponse.status()).toBe(200);

    const data = await pokemonResponse.json();
    expect(data).toBeDefined();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');

    // Should either redirect or show 404 page
    const url = page.url();
    const isNotFoundPage = url.includes('not-found') || url.includes('404') || url.includes('+not-found');
    const isRedirected = url.endsWith('/');

    // Log actual URL for debugging
    console.log(`Navigated to: ${url}`);

    // Check if page shows appropriate 404 content or redirects
    const hasNotFoundText = await page.locator('text=/not found/i').count() > 0;
    const has404Text = await page.locator('text=/404/i').count() > 0;

    expect(isNotFoundPage || isRedirected || hasNotFoundText || has404Text).toBe(true);
  });
});