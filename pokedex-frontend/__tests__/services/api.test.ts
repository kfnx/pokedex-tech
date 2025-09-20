import { pokeAPI } from '../../services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('PokeAPI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPokemonList', () => {
    it('should fetch Pokemon list with default parameters', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'bulbasaur',
            height: 7,
            weight: 69,
            baseExperience: 64,
            order: 1,
            spriteFrontDefault: 'https://example.com/sprite.png',
            types: [{ slot: 1, type: { id: 12, name: 'grass' } }]
          }
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 151,
          totalPages: 8,
          hasNext: true,
          hasPrev: false
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await pokeAPI.getPokemonList();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pokemon'),
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should build query parameters correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} })
      });

      await pokeAPI.getPokemonList({
        page: 2,
        limit: 10,
        search: 'pikachu',
        type: 'electric',
        generation: 1,
        sort: 'name'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=10&search=pikachu&type=electric&generation=1&sort=name'),
        expect.any(Object)
      );
    });

    it('should throw error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(pokeAPI.getPokemonList()).rejects.toThrow('Failed to fetch Pokemon list');
    });

    it('should handle timeout correctly', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AbortError')), 100);
        })
      );

      // Mock AbortError
      const abortError = new Error('Request timeout');
      abortError.name = 'AbortError';
      (fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(pokeAPI.getPokemonList()).rejects.toThrow('Request timeout');
    });
  });

  describe('getPokemonById', () => {
    it('should fetch Pokemon by ID', async () => {
      const mockPokemon = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        types: [{ slot: 1, type: { id: 13, name: 'electric' } }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon
      });

      const result = await pokeAPI.getPokemonById(25);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pokemon/25'),
        expect.any(Object)
      );
      expect(result).toEqual(mockPokemon);
    });

    it('should throw error for invalid Pokemon ID', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(pokeAPI.getPokemonById(9999)).rejects.toThrow('Failed to fetch Pokemon');
    });
  });

  describe('getTypes', () => {
    it('should fetch Pokemon types', async () => {
      const mockTypes = [
        { id: 1, name: 'normal' },
        { id: 2, name: 'fighting' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTypes
      });

      const result = await pokeAPI.getTypes();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/types'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTypes);
    });
  });

  describe('searchPokemon', () => {
    it('should search Pokemon with query', async () => {
      const mockSearchResponse = {
        query: 'fire',
        results: [
          { id: 4, name: 'charmander' },
          { id: 37, name: 'vulpix' }
        ],
        count: 2
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const result = await pokeAPI.searchPokemon('fire');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pokemon/search?q=fire'),
        expect.any(Object)
      );
      expect(result).toEqual(mockSearchResponse);
    });

    it('should handle search with options', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ query: 'test', results: [], count: 0 })
      });

      await pokeAPI.searchPokemon('test', { limit: 5, fuzzy: true });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test&limit=5&fuzzy=true'),
        expect.any(Object)
      );
    });
  });
});