import { describe, it, expect } from 'bun:test';

describe('Pokemon API Endpoints', () => {
  const BASE_URL = 'http://localhost:3000'; // Docker development server URL

  describe('GET /api/pokemon', () => {
    it('should return paginated Pokemon list with default parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/pokemon`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);

      // Check meta structure
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('limit');
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('totalPages');
      expect(data.meta).toHaveProperty('hasNext');
      expect(data.meta).toHaveProperty('hasPrev');

      // Validate meta types
      expect(typeof data.meta.page).toBe('number');
      expect(typeof data.meta.limit).toBe('number');
      expect(typeof data.meta.total).toBe('number');
      expect(typeof data.meta.totalPages).toBe('number');
      expect(typeof data.meta.hasNext).toBe('boolean');
      expect(typeof data.meta.hasPrev).toBe('boolean');

      // Default pagination values
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(20);
    });

    it('should respect custom pagination parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/pokemon?page=2&limit=5`);

      if (response.status === 200) {
        const data = await response.json();
        expect(data.meta.page).toBe(2);
        expect(data.meta.limit).toBe(5);
        expect(data.data.length).toBeLessThanOrEqual(5);
      }
    });

    it('should handle search parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/pokemon?search=pika`);

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('data');
        expect(Array.isArray(data.data)).toBe(true);
      }
    });

    it('should validate Pokemon data structure', async () => {
      const response = await fetch(`${BASE_URL}/api/pokemon?limit=1`);

      if (response.status === 200) {
        const data = await response.json();

        if (data.data.length > 0) {
          const pokemon = data.data[0];
          expect(pokemon).toHaveProperty('id');
          expect(pokemon).toHaveProperty('name');
          expect(pokemon).toHaveProperty('height');
          expect(pokemon).toHaveProperty('weight');
          expect(pokemon).toHaveProperty('types');

          expect(typeof pokemon.id).toBe('number');
          expect(typeof pokemon.name).toBe('string');
          expect(typeof pokemon.height).toBe('number');
          expect(typeof pokemon.weight).toBe('number');
          expect(Array.isArray(pokemon.types)).toBe(true);
        }
      }
    });
  });

  describe('GET /api/pokemon/compare', () => {
    it('should validate compare parameter format', async () => {
      const response = await fetch(`${BASE_URL}/api/pokemon/compare`);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });

    it('should handle valid Pokemon IDs', async () => {
      const response = await fetch(`${BASE_URL}/api/pokemon/compare?ids=1,25`);

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('pokemon');
        expect(data).toHaveProperty('comparison');
        expect(Array.isArray(data.pokemon)).toBe(true);
        expect(data.comparison).toHaveProperty('requested');
        expect(data.comparison).toHaveProperty('found');
        expect(data.comparison).toHaveProperty('missing');
      }
    });

    it('should reject too many Pokemon IDs', async () => {
      const manyIds = Array.from({ length: 10 }, (_, i) => i + 1).join(',');
      const response = await fetch(`${BASE_URL}/api/pokemon/compare?ids=${manyIds}`);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('3');
    });
  });

  describe('GET /api/types', () => {
    it('should return list of Pokemon types', async () => {
      const response = await fetch(`${BASE_URL}/api/types`);

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
          const type = data[0];
          expect(type).toHaveProperty('id');
          expect(type).toHaveProperty('name');
          expect(typeof type.id).toBe('number');
          expect(typeof type.name).toBe('string');
        }
      }
    });
  });
});