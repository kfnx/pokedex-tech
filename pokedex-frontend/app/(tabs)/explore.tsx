import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PokemonCard } from '@/components/pokemon/pokemon-card';
import { AutoSuggest } from '@/components/ui/auto-suggest';
import { usePokemonSearch } from '@/hooks/use-pokemon';
import { usePokemonSuggestions } from '@/hooks/use-pokemon-suggestions';
import { Pokemon } from '@/services/api';

export default function TabTwoScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [enableFuzzySearch, setEnableFuzzySearch] = useState(false);

  const backgroundColor = '#000000';
  const textColor = '#FFFFFF';
  const borderColor = '#333333';
  const activeBgColor = '#0A84FF';

  const { results, loading, error } = usePokemonSearch(searchQuery, 300, enableFuzzySearch);
  const { suggestions, loading: suggestionsLoading } = usePokemonSuggestions(
    searchQuery,
    showSuggestions && searchQuery.length >= 2 && !activeFilter
  );

  const handlePokemonPress = useCallback((pokemon: Pokemon) => {
    router.push(`/pokemon/${pokemon.id}`);
  }, []);

  const renderItem = useCallback(({ item }: { item: Pokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => handlePokemonPress(item)}
    />
  ), [handlePokemonPress]);

  const quickSearches = [
    { label: 'Fire', value: 'fire' },
    { label: 'Water', value: 'water' },
    { label: 'Grass', value: 'grass' },
    { label: 'Electric', value: 'electric' },
    { label: 'Dragon', value: 'dragon' },
    { label: 'Psychic', value: 'psychic' },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/pokedex.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { borderColor, color: textColor }]}
            placeholder="Search by name, type, or ability..."
            placeholderTextColor={textColor + '80'}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              // Clear active filter if user manually types something different
              if (activeFilter && text !== activeFilter) {
                setActiveFilter(null);
              }
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          <AutoSuggest
            suggestions={suggestions}
            loading={suggestionsLoading}
            visible={showSuggestions && suggestions.length > 0}
            onSuggestionPress={(suggestion) => {
              setSearchQuery(suggestion.name);
              setActiveFilter(suggestion.name);
              setShowSuggestions(false);
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickSearchContainer}
        >
          {quickSearches.map((search) => {
            const isActive = activeFilter === search.value;
            return (
              <Pressable
                key={search.value}
                style={[
                  styles.quickSearchChip,
                  {
                    borderColor: isActive ? activeBgColor : borderColor,
                    backgroundColor: isActive ? activeBgColor : 'transparent',
                  }
                ]}
                onPress={() => {
                  setSearchQuery(search.value);
                  setActiveFilter(search.value);
                }}
              >
                <ThemedText
                  style={[
                    styles.quickSearchText,
                    { color: isActive ? 'white' : textColor }
                  ]}
                >
                  {search.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.optionsContainer}>
          <Pressable
            style={[
              styles.fuzzyToggle,
              {
                borderColor: enableFuzzySearch ? activeBgColor : borderColor,
                backgroundColor: enableFuzzySearch ? activeBgColor : 'transparent',
              }
            ]}
            onPress={() => setEnableFuzzySearch(!enableFuzzySearch)}
          >
            <ThemedText
              style={[
                styles.fuzzyToggleText,
                { color: enableFuzzySearch ? 'white' : textColor }
              ]}
            >
              {enableFuzzySearch ? '🔍' : '📝'} {enableFuzzySearch ? 'Fuzzy' : 'Exact'}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColor} />
            <ThemedText style={styles.loadingText}>Searching...</ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
          </View>
        )}

        {!loading && !error && searchQuery.length >= 2 && (
          <>
            <ThemedText style={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </ThemedText>
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <ThemedView style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    No Pokémon found matching &quot;{searchQuery}&quot;
                  </ThemedText>
                </ThemedView>
              }
            />
          </>
        )}

        {!loading && !searchQuery && (
          <ThemedView style={styles.instructionContainer}>
            <ThemedText style={styles.instructionTitle}>Search Tips</ThemedText>
            <ThemedText style={styles.instructionText}>
              • Search by Pokémon name (e.g., &quot;Pikachu&quot;)
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              • Search by type (e.g., &quot;fire&quot;, &quot;water&quot;)
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              • Search by ability (e.g., &quot;overgrow&quot;)
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              • Minimum 2 characters to start searching
            </ThemedText>
          </ThemedView>
        )}

        {!loading && searchQuery.length === 1 && (
          <ThemedView style={styles.instructionContainer}>
            <ThemedText style={styles.instructionText}>
              Type at least 2 characters to search
            </ThemedText>
          </ThemedView>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerLogo: {
    height: 60,
    width: '100%',
    marginBottom: 16,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  quickSearchContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  quickSearchChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  quickSearchText: {
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  fuzzyToggle: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fuzzyToggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  instructionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
  },
});
