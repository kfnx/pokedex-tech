import { useState, useEffect, useCallback, useRef } from 'react';
import { pokeAPI, Pokemon } from '@/services/api';

interface UsePokemonListOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  generation?: number;
  sort?: 'id' | 'name' | 'height' | 'weight';
}

export function usePokemonList(options: UsePokemonListOptions = {}) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchPokemon = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pokeAPI.getPokemonList(options);
      setPokemon(response.data);
      setHasMore(response.meta.hasNext);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
      setPokemon([]);
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.search, options.type, options.generation, options.sort]);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  return {
    pokemon,
    loading,
    error,
    hasMore,
    totalPages,
    total,
    refetch: fetchPokemon,
  };
}

export function usePokemonDetails(id: number | null) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPokemon(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await pokeAPI.getPokemonDetails(id);
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon details');
        setPokemon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  return { pokemon, loading, error };
}

export function usePokemonSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await pokeAPI.searchPokemon(query);
        setResults(response.results);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Search failed');
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs]);

  return { results, loading, error };
}

export function useInfinitePokemonList(options: Omit<UsePokemonListOptions, 'page'> = {}) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const response = await pokeAPI.getPokemonList({ ...options, page: page + 1 });
      setPokemon(prev => [...prev, ...response.data]);
      setHasMore(response.meta.hasNext);
      setPage(page + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more Pokemon');
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, options]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await pokeAPI.getPokemonList({ ...options, page: 1 });
        setPokemon(response.data);
        setHasMore(response.meta.hasNext);
        setPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
        setPokemon([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [options.limit, options.search, options.type, options.generation, options.sort]);

  return {
    pokemon,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  };
}