import { describe, it, expect, mock } from 'bun:test';
import { fetchFromPokeAPI } from '../../src/services/pokeapi';

describe('PokeAPI Service', () => {
  describe('fetchFromPokeAPI', () => {
    it('should fetch data successfully from valid URL', async () => {
      // Mock the global fetch function
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: 'pikachu', id: 25 }),
        })
      );

      global.fetch = mockFetch as any;

      const result = await fetchFromPokeAPI('https://pokeapi.co/api/v2/pokemon/25');

      expect(result).toEqual({ name: 'pikachu', id: 25 });
      expect(mockFetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/25');
    });

    it('should throw error for failed requests', async () => {
      // Mock fetch to return error response
      const mockFetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        })
      );

      global.fetch = mockFetch as any;

      await expect(
        fetchFromPokeAPI('https://pokeapi.co/api/v2/pokemon/99999')
      ).rejects.toThrow('PokeAPI request failed: 404');
    });

    it('should handle network errors', async () => {
      // Mock fetch to throw network error
      const mockFetch = mock(() => Promise.reject(new Error('Network error')));

      global.fetch = mockFetch as any;

      await expect(
        fetchFromPokeAPI('https://pokeapi.co/api/v2/pokemon/25')
      ).rejects.toThrow('Network error');
    });
  });
});