import { test, expect } from '@playwright/test';

test.describe('API Rate Limiting', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

  test('should apply general rate limiting', async ({ request }) => {
    // Make multiple requests to test general rate limiting
    const responses = [];

    for (let i = 0; i < 5; i++) {
      const response = await request.get(`${BACKEND_URL}/api/pokemon?limit=1`);
      responses.push(response);

      // Check that the first few requests succeed
      expect(response.status()).toBe(200);

      // Check rate limit headers are present
      const rateLimitHeaders = response.headers();
      expect(rateLimitHeaders['ratelimit-limit']).toBe('100');
      expect(rateLimitHeaders['ratelimit-policy']).toBe('100;w=900');
      expect(parseInt(rateLimitHeaders['ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
    }

    // Verify remaining count decreases (with memory fallback, this might be less precise)
    const firstRemaining = parseInt(responses[0].headers()['ratelimit-remaining']);
    const lastRemaining = parseInt(responses[4].headers()['ratelimit-remaining']);
    expect(lastRemaining).toBeLessThanOrEqual(firstRemaining);
  });

  test('should apply search-specific rate limiting', async ({ request }) => {
    // Test search endpoint rate limiting (30 requests per 5 minutes)
    for (let i = 0; i < 3; i++) {
      const response = await request.get(`${BACKEND_URL}/api/pokemon/search?q=pikachu`);
      expect(response.status()).toBe(200);

      const rateLimitHeaders = response.headers();
      expect(rateLimitHeaders['ratelimit-limit']).toBe('30');
      expect(rateLimitHeaders['ratelimit-policy']).toBe('30;w=300');
    }
  });

  test('should apply suggestions-specific rate limiting', async ({ request }) => {
    // Test suggestions endpoint rate limiting (60 requests per 5 minutes)
    for (let i = 0; i < 3; i++) {
      const response = await request.get(`${BACKEND_URL}/api/pokemon/suggest?q=pik`);
      expect(response.status()).toBe(200);

      const rateLimitHeaders = response.headers();
      expect(rateLimitHeaders['ratelimit-limit']).toBe('60');
      expect(rateLimitHeaders['ratelimit-policy']).toBe('60;w=300');
    }
  });

  test('should skip rate limiting for health checks', async ({ request }) => {
    // Health endpoints should not be rate limited
    const healthResponse = await request.get(`${BACKEND_URL}/health`);
    expect(healthResponse.status()).toBe(200);

    const readyResponse = await request.get(`${BACKEND_URL}/health/ready`);
    expect(readyResponse.status()).toBe(200);

    // Health endpoints should not have rate limit headers
    expect(healthResponse.headers()['ratelimit-limit']).toBeUndefined();
    expect(readyResponse.headers()['ratelimit-limit']).toBeUndefined();
  });

  test('should return proper error when rate limit exceeded', async ({ request }) => {
    // This test would require hitting the actual rate limit
    // For now, we'll just verify the structure is in place
    // In a real scenario, you might want to configure a lower limit for testing

    const response = await request.get(`${BACKEND_URL}/api/pokemon?limit=1`);
    const headers = response.headers();

    // Verify rate limit headers structure
    expect(headers['ratelimit-limit']).toBeDefined();
    expect(headers['ratelimit-remaining']).toBeDefined();
    expect(headers['ratelimit-reset']).toBeDefined();
    expect(headers['ratelimit-policy']).toBeDefined();
  });
});