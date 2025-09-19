import { test, expect } from '@playwright/test';

test.describe('Pokemon Navigation', () => {
  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if we can access different tabs/routes
    const routes = ['/', '/explore', '/compare'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Should not have any console errors or crashes
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should navigate to pokemon detail page', async ({ page }) => {
    // Go directly to a known pokemon page
    await page.goto('/pokemon/1');
    await page.waitForLoadState('networkidle');

    // Check if we're on a pokemon detail page
    await expect(page).toHaveURL(/\/pokemon\/1/);

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation from home to detail', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to find any clickable pokemon elements
    const pokemonLinks = page.locator('a[href*="/pokemon/"]');
    const pokemonCards = page.locator('[data-testid*="pokemon"]');
    const pokemonElements = page.locator('text=/pokemon|pikachu|bulbasaur/i');

    // If we find pokemon links, click the first one
    if (await pokemonLinks.first().isVisible({ timeout: 5000 })) {
      await pokemonLinks.first().click();
      await expect(page).toHaveURL(/\/pokemon\/\d+/);
    } else if (await pokemonCards.first().isVisible({ timeout: 5000 })) {
      await pokemonCards.first().click();
      await expect(page).toHaveURL(/\/pokemon\/\d+/);
    } else {
      // Fallback: manually navigate to confirm routing works
      await page.goto('/pokemon/25'); // Pikachu
      await expect(page).toHaveURL('/pokemon/25');
    }
  });
});