import { test, expect } from '@playwright/test';

test.describe('App Health Check', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page loads without errors by looking for the tab navigation
    const tabNavigation = page.locator('text=Pokédex').or(page.locator('text=Search')).or(page.locator('text=Compare'));
    await expect(tabNavigation.first()).toBeVisible({ timeout: 15000 });

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
});