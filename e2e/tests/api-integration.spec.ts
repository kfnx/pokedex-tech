import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should load pokemon data from API', async ({ page }) => {
    // Intercept API calls to verify backend communication
    const apiResponse = page.waitForResponse('**/api/pokemon**');

    await page.goto('/');

    const response = await apiResponse;
    expect(response.status()).toBe(200);

    const jsonData = await response.json();
    expect(jsonData).toBeDefined();

    // Check if response has expected structure
    if (Array.isArray(jsonData)) {
      expect(jsonData.length).toBeGreaterThan(0);
    } else if (jsonData.results) {
      expect(Array.isArray(jsonData.results)).toBe(true);
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/pokemon**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // App should still load without crashing
    await expect(page.locator('body')).toBeVisible();

    // Could check for error message display
    const errorMessage = page.locator('text=/error|failed|unavailable/i');
    if (await errorMessage.isVisible({ timeout: 3000 })) {
      console.log('Error handling working correctly');
    }
  });

  test('should make successful requests to different endpoints', async ({ page }) => {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
    const endpoints = [
      '/api/pokemon',
      '/api/pokemon/1',
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`${BACKEND_URL}${endpoint}`);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});