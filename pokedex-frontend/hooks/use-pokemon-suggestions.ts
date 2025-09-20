import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { pokeAPI } from '@/services/api';

interface PokemonSuggestion {
  id: number;
  name: string;
  spriteFrontDefault: string;
}

interface SuggestionResponse {
  query: string;
  suggestions: PokemonSuggestion[];
  count: number;
}

export function usePokemonSuggestions(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${pokeAPI.baseURL}/api/pokemon/suggest?q=${encodeURIComponent(searchQuery)}&limit=5`);

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.status}`);
        }

        const data: SuggestionResponse = await response.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (enabled && query.trim()) {
      fetchSuggestions(query.trim());
    } else {
      setSuggestions([]);
      setLoading(false);
    }

    return () => {
      fetchSuggestions.cancel();
    };
  }, [query, enabled, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    clearSuggestions
  };
}