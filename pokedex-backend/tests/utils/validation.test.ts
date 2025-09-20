import { describe, it, expect } from 'bun:test';
import {
  parsePagination,
  validatePokemonId,
  parseMultiplePokemonIds,
  validateSearchQuery,
  validateSortParam,
  calculateTotalPages,
  isDataStale,
  extractPokemonIdFromUrl,
  validateGeneration,
} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('parsePagination', () => {
    it('should parse valid pagination parameters', () => {
      const result = parsePagination({ page: '2', limit: '10' });
      expect(result).toEqual({
        pageNum: 2,
        limitNum: 10,
        skip: 10,
      });
    });

    it('should use defaults for missing parameters', () => {
      const result = parsePagination({});
      expect(result).toEqual({
        pageNum: 1,
        limitNum: 20,
        skip: 0,
      });
    });

    it('should handle invalid page numbers', () => {
      const result = parsePagination({ page: '0', limit: '-5' });
      expect(result.pageNum).toBe(1);
      expect(result.limitNum).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const result = parsePagination({ limit: '500' });
      expect(result.limitNum).toBe(100);
    });

    it('should handle numeric inputs', () => {
      const result = parsePagination({ page: 3, limit: 25 });
      expect(result).toEqual({
        pageNum: 3,
        limitNum: 25,
        skip: 50,
      });
    });
  });

  describe('validatePokemonId', () => {
    it('should validate correct Pokemon IDs', () => {
      expect(validatePokemonId('25')).toBe(25);
      expect(validatePokemonId(1)).toBe(1);
      expect(validatePokemonId('1000')).toBe(1000);
    });

    it('should reject invalid Pokemon IDs', () => {
      expect(validatePokemonId('0')).toBe(null);
      expect(validatePokemonId('-1')).toBe(null);
      expect(validatePokemonId('10001')).toBe(null);
      expect(validatePokemonId('abc')).toBe(null);
      expect(validatePokemonId('')).toBe(null);
    });
  });

  describe('parseMultiplePokemonIds', () => {
    it('should parse comma-separated valid IDs', () => {
      const result = parseMultiplePokemonIds('1,25,150');
      expect(result).toEqual([1, 25, 150]);
    });

    it('should filter out invalid IDs', () => {
      const result = parseMultiplePokemonIds('1,abc,25,0,150');
      expect(result).toEqual([1, 25, 150]);
    });

    it('should handle whitespace', () => {
      const result = parseMultiplePokemonIds(' 1 , 25 , 150 ');
      expect(result).toEqual([1, 25, 150]);
    });

    it('should return empty array for invalid input', () => {
      expect(parseMultiplePokemonIds('')).toEqual([]);
      expect(parseMultiplePokemonIds('abc,def')).toEqual([]);
    });

    it('should handle non-string input gracefully', () => {
      expect(parseMultiplePokemonIds(null as any)).toEqual([]);
      expect(parseMultiplePokemonIds(undefined as any)).toEqual([]);
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate queries meeting minimum length', () => {
      expect(validateSearchQuery('pikachu')).toBe('pikachu');
      expect(validateSearchQuery('  fire  ')).toBe('fire');
    });

    it('should reject queries too short', () => {
      expect(validateSearchQuery('a')).toBe(null);
      expect(validateSearchQuery('')).toBe(null);
      expect(validateSearchQuery('  ')).toBe(null);
    });

    it('should handle custom minimum length', () => {
      expect(validateSearchQuery('abc', 4)).toBe(null);
      expect(validateSearchQuery('abcd', 4)).toBe('abcd');
    });

    it('should handle invalid input types', () => {
      expect(validateSearchQuery(undefined)).toBe(null);
      expect(validateSearchQuery(null as any)).toBe(null);
      expect(validateSearchQuery(123 as any)).toBe(null);
    });
  });

  describe('validateSortParam', () => {
    it('should return valid sort parameters', () => {
      expect(validateSortParam('name')).toBe('name');
      expect(validateSortParam('height')).toBe('height');
      expect(validateSortParam('weight')).toBe('weight');
      expect(validateSortParam('id')).toBe('id');
    });

    it('should default to id for invalid parameters', () => {
      expect(validateSortParam('invalid')).toBe('id');
      expect(validateSortParam('')).toBe('id');
      expect(validateSortParam(undefined)).toBe('id');
    });
  });

  describe('calculateTotalPages', () => {
    it('should calculate correct number of pages', () => {
      expect(calculateTotalPages(100, 20)).toBe(5);
      expect(calculateTotalPages(101, 20)).toBe(6);
      expect(calculateTotalPages(0, 20)).toBe(0);
      expect(calculateTotalPages(5, 20)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(calculateTotalPages(1, 1)).toBe(1);
      expect(calculateTotalPages(0, 1)).toBe(0);
    });
  });

  describe('isDataStale', () => {
    it('should return true for null dates', () => {
      expect(isDataStale(null, 1000)).toBe(true);
    });

    it('should return true for stale data', () => {
      const oldDate = new Date(Date.now() - 2000); // 2 seconds ago
      expect(isDataStale(oldDate, 1000)).toBe(true); // 1 second cache
    });

    it('should return false for fresh data', () => {
      const recentDate = new Date(Date.now() - 500); // 0.5 seconds ago
      expect(isDataStale(recentDate, 1000)).toBe(false); // 1 second cache
    });
  });

  describe('extractPokemonIdFromUrl', () => {
    it('should extract ID from valid PokeAPI URLs', () => {
      expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
      expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/1')).toBe(1);
      expect(extractPokemonIdFromUrl('/api/v2/pokemon/150/')).toBe(150);
    });

    it('should return null for invalid URLs', () => {
      expect(extractPokemonIdFromUrl('https://pokeapi.co/api/v2/type/fire/')).toBe(null);
      expect(extractPokemonIdFromUrl('invalid-url')).toBe(null);
      expect(extractPokemonIdFromUrl('')).toBe(null);
    });
  });

  describe('validateGeneration', () => {
    it('should validate correct generation numbers', () => {
      expect(validateGeneration('1')).toBe(1);
      expect(validateGeneration(5)).toBe(5);
      expect(validateGeneration('9')).toBe(9);
    });

    it('should reject invalid generation numbers', () => {
      expect(validateGeneration('0')).toBe(null);
      expect(validateGeneration('10')).toBe(null);
      expect(validateGeneration('abc')).toBe(null);
      expect(validateGeneration(undefined)).toBe(null);
      expect(validateGeneration('')).toBe(null);
    });
  });
});