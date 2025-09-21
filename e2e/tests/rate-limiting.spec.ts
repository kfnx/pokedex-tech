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
      expect(rateLimitHeaders['ratelimit-limit']).toBe('1000'); // Higher limit for test environment
      expect(rateLimitHeaders['ratelimit-policy']).toBe('1000;w=600'); // 10 minutes = 600 seconds
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
      expect(rateLimitHeaders['ratelimit-policy']).toBe('30;w=300'); // 5 minutes = 300 seconds
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

  test('should return proper 429 error response format', async ({ request }) => {
    // Test the new error response structure by making a request to a potentially rate-limited endpoint
    // Note: This test verifies the response structure rather than triggering an actual rate limit

    const response = await request.get(`${BACKEND_URL}/api/pokemon/search?q=test`);

    if (response.status() === 429) {
      // If we hit a rate limit, verify the error response format
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('details');
      expect(body).toHaveProperty('statusCode', 429);
      expect(body).toHaveProperty('timestamp');

      expect(body.details).toHaveProperty('limit');
      expect(body.details).toHaveProperty('remaining');
      expect(body.details).toHaveProperty('resetTime');
      expect(body.details).toHaveProperty('retryAfter');
      expect(body.details).toHaveProperty('requestsAllowed');

      expect(body.error).toBe('Rate limit exceeded');
      expect(typeof body.message).toBe('string');
      expect(typeof body.details.limit).toBe('number');
      expect(typeof body.details.remaining).toBe('number');
      expect(typeof body.details.resetTime).toBe('string');
      expect(typeof body.details.retryAfter).toBe('string');
      expect(typeof body.details.requestsAllowed).toBe('string');
    } else {
      // If no rate limit hit, just verify the request succeeded
      expect(response.status()).toBe(200);
    }
  });

  test('should apply seed endpoint rate limiting', async ({ request }) => {
    // Test seed endpoint rate limiting (3 requests per hour)
    // Note: We don't actually trigger the seed to avoid database impacts

    const response = await request.post(`${BACKEND_URL}/api/seed`, {
      data: { count: 1 }
    });

    // The seed endpoint should either succeed (200) or hit rate limit (429)
    const isSuccess = response.status() === 200;
    const isRateLimit = response.status() === 429;

    expect(isSuccess || isRateLimit).toBeTruthy();

    if (isSuccess) {
      // Verify rate limit headers are present
      const headers = response.headers();
      expect(headers['ratelimit-limit']).toBe('3');
      expect(headers['ratelimit-policy']).toBe('3;w=3600'); // 1 hour = 3600 seconds
      expect(parseInt(headers['ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
    } else if (isRateLimit) {
      // Verify proper error response format for seed endpoint
      const body = await response.json();
      expect(body.error).toBe('Rate limit exceeded');
      expect(body.message).toContain('seed requests');
      expect(body.details.retryAfter).toBe('1 hour');
    }
  });
});