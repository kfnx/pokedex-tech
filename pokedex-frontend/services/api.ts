export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface SearchResponse<T> {
  query: string;
  results: T[];
  count: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number | null;
  order: number;
  spriteFrontDefault: string | null;
  spriteBackDefault: string | null;
  spriteFrontShiny: string | null;
  spriteBackShiny: string | null;
  cries: any;
  lastFetched: string;
  types?: PokemonType[];
  abilities?: PokemonAbility[];
  stats?: PokemonStat[];
  species?: PokemonSpecies;
}

export interface PokemonType {
  slot: number;
  type: Type;
}

export interface Type {
  id: number;
  name: string;
  generation: number | null;
}

export interface PokemonAbility {
  slot: number;
  isHidden: boolean;
  ability: Ability;
}

export interface Ability {
  id: number;
  name: string;
}

export interface PokemonStat {
  baseStat: number;
  effort: number;
  stat: Stat;
}

export interface Stat {
  id: number;
  name: string;
  gameIndex: number | null;
  isBattleOnly: boolean;
}

export interface PokemonSpecies {
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
}

class PokeAPIService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async getPokemonList(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    generation?: number;
    sort?: 'id' | 'name' | 'height' | 'weight';
  } = {}): Promise<PaginatedResponse<Pokemon>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.generation) queryParams.append('generation', params.generation.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/pokemon?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Pokemon list');
    }

    return response.json();
  }

  async getPokemonDetails(id: number): Promise<Pokemon> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/pokemon/${id}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Pokemon not found');
      }
      throw new Error('Failed to fetch Pokemon details');
    }

    return response.json();
  }

  async searchPokemon(query: string, limit = 10): Promise<SearchResponse<Pokemon>> {
    const queryParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/pokemon/search?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return response.json();
  }

  async comparePokemon(ids: number[]): Promise<{
    pokemon: Pokemon[];
    comparison: {
      requested: number[];
      found: number[];
      missing: number[];
    };
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/pokemon/compare?ids=${ids.join(',')}`
    );

    if (!response.ok) {
      throw new Error('Comparison failed');
    }

    return response.json();
  }

  async getTypes(): Promise<Type[]> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/types`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch types');
    }

    return response.json();
  }

  async getAbilities(limit = 50): Promise<Ability[]> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/abilities?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch abilities');
    }

    return response.json();
  }

  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/health`,
      {},
      3000
    );

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }
}

export const pokeAPI = new PokeAPIService();