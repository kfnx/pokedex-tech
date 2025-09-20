/**
 * Validation utilities for Pokemon data and API inputs
 */

export interface PaginationParams {
  page?: string | number;
  limit?: string | number;
}

export interface ParsedPagination {
  pageNum: number;
  limitNum: number;
  skip: number;
}

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(params: PaginationParams): ParsedPagination {
  const pageNum = Math.max(1, parseInt(String(params.page || '1')));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(params.limit || '20'))));
  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
}

/**
 * Validate Pokemon ID
 */
export function validatePokemonId(id: string | number): number | null {
  const pokemonId = parseInt(String(id));
  if (isNaN(pokemonId) || pokemonId < 1 || pokemonId > 10000) {
    return null;
  }
  return pokemonId;
}

/**
 * Parse and validate Pokemon IDs from comma-separated string
 */
export function parseMultiplePokemonIds(ids: string): number[] {
  if (!ids || typeof ids !== 'string') {
    return [];
  }

  return ids
    .split(',')
    .map(id => validatePokemonId(id.trim()))
    .filter((id): id is number => id !== null);
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string | undefined, minLength: number = 2): string | null {
  if (!query || typeof query !== 'string') {
    return null;
  }
  const trimmed = query.trim();
  if (trimmed.length < minLength) {
    return null;
  }
  return trimmed;
}

/**
 * Validate sort parameter
 */
export function validateSortParam(sort: string | undefined): 'id' | 'name' | 'height' | 'weight' {
  const validSorts = ['id', 'name', 'height', 'weight'] as const;
  if (!sort || !validSorts.includes(sort as any)) {
    return 'id';
  }
  return sort as 'id' | 'name' | 'height' | 'weight';
}

/**
 * Calculate total pages for pagination
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Check if data is stale based on cache duration
 */
export function isDataStale(lastFetched: Date | null, cacheDurationMs: number): boolean {
  if (!lastFetched) {
    return true;
  }
  const now = new Date();
  const ageMs = now.getTime() - lastFetched.getTime();
  return ageMs > cacheDurationMs;
}

/**
 * Extract Pokemon ID from PokeAPI URL
 */
export function extractPokemonIdFromUrl(url: string): number | null {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Validate generation number
 */
export function validateGeneration(generation: string | number | undefined): number | null {
  if (!generation) return null;
  const gen = parseInt(String(generation));
  if (isNaN(gen) || gen < 1 || gen > 9) {
    return null;
  }
  return gen;
}