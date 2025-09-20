import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

describe('Health API Endpoints', () => {
  const BASE_URL = 'http://localhost:3001'; // Development server URL

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('database');
      expect(['healthy', 'unhealthy']).toContain(data.status);
      expect(['connected', 'disconnected']).toContain(data.database);
    });

    it('should have proper response structure', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(typeof data.status).toBe('string');
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.database).toBe('string');

      // Validate timestamp is a valid ISO string
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await fetch(`${BASE_URL}/health/ready`);

      expect([200, 503]).toContain(response.status);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('database');
      expect(data).toHaveProperty('ready');
      expect(typeof data.ready).toBe('boolean');
    });

    it('should include types count when ready', async () => {
      const response = await fetch(`${BASE_URL}/health/ready`);
      const data = await response.json();

      if (data.ready === true) {
        expect(data).toHaveProperty('types');
        expect(typeof data.types).toBe('number');
        expect(data.types).toBeGreaterThanOrEqual(0);
      }
    });
  });
});