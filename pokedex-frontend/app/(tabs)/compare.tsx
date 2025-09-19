import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useInfinitePokemonList } from '@/hooks/use-pokemon';
import { PokemonCard } from '@/components/pokemon/pokemon-card';
import { Pokemon, pokeAPI } from '@/services/api';

interface ComparisonData {
  pokemon: Pokemon[];
  comparison?: {
    requested: number[];
    found: number[];
    missing: number[];
  };
}

export default function CompareScreen() {
  const [selectedPokemon, setSelectedPokemon] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#222' }, 'background');

  const {
    pokemon: allPokemon,
    loading: listLoading,
    loadMore,
    hasMore,
  } = useInfinitePokemonList({
    limit: 20,
    search: searchQuery,
  });

  const fetchComparison = useCallback(async () => {
    if (selectedPokemon.length < 2) return;

    setLoading(true);
    try {
      const data = await pokeAPI.comparePokemon(selectedPokemon);
      setComparisonData(data);
    } catch (error) {
      console.error('Error fetching comparison:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPokemon]);

  const togglePokemonSelection = useCallback((id: number) => {
    setSelectedPokemon(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPokemon([]);
    setComparisonData(null);
  }, []);

  const getStatColor = (value: number) => {
    if (value >= 150) return '#4CAF50';
    if (value >= 100) return '#FFC107';
    if (value >= 75) return '#FF9800';
    if (value >= 50) return '#FF5722';
    return '#F44336';
  };

  const renderStatBar = (label: string, values: number[], pokemon: Pokemon[]) => {
    const maxValue = Math.max(...values, 200);
    return (
      <View style={styles.statRow}>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
        <View style={styles.statBarsContainer}>
          {values.map((value, index) => (
            <View key={index} style={styles.statBarWrapper}>
              <Image
                source={pokemon[index]?.spriteFrontDefault}
                style={styles.statPokemonImage}
                contentFit="contain"
              />
              <View style={styles.statBarContainer}>
                <View
                  style={[
                    styles.statBar,
                    {
                      width: `${(value / maxValue) * 100}%`,
                      backgroundColor: getStatColor(value),
                    }
                  ]}
                />
              </View>
              <ThemedText style={styles.statValue}>{value}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const handleDoneSelection = useCallback(() => {
    setShowSelector(false);
    if (selectedPokemon.length >= 2) {
      fetchComparison();
    }
  }, [selectedPokemon.length, fetchComparison]);

  const renderPokemonSelector = () => (
    <Modal
      visible={showSelector}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDoneSelection}
    >
      <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <ThemedText type="title">Select Pokemon</ThemedText>
          <Pressable onPress={handleDoneSelection} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>Done</ThemedText>
          </Pressable>
        </View>

        <TextInput
          style={[styles.searchInput, { borderColor, color: textColor }]}
          placeholder="Search Pokemon..."
          placeholderTextColor={textColor + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={allPokemon}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.selectorItem,
                { borderColor },
                selectedPokemon.includes(item.id) && styles.selectedItem,
              ]}
              onPress={() => togglePokemonSelection(item.id)}
            >
              <Image source={item.spriteFrontDefault} style={styles.selectorImage} />
              <ThemedText style={styles.selectorName}>{item.name}</ThemedText>
              {selectedPokemon.includes(item.id) && (
                <View style={styles.checkmark}>
                  <ThemedText>✓</ThemedText>
                </View>
              )}
            </Pressable>
          )}
          numColumns={width >= 768 ? 4 : 3}
          columnWrapperStyle={styles.selectorGrid}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </ThemedView>
    </Modal>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={textColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Compare Pokemon</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select up to 3 Pokemon to compare their stats
          </ThemedText>
        </View>

        <View style={styles.selectionContainer}>
          <View style={styles.selectedPokemonRow}>
            {[0, 1, 2].map((index) => {
              const pokemonId = selectedPokemon[index];
              const pokemon = comparisonData?.pokemon.find(p => p.id === pokemonId);

              return (
                <Pressable
                  key={index}
                  style={[styles.pokemonSlot, { backgroundColor: cardBg, borderColor }]}
                  onPress={() => setShowSelector(true)}
                >
                  {pokemon ? (
                    <>
                      <Image
                        source={pokemon.spriteFrontDefault}
                        style={styles.pokemonImage}
                        contentFit="contain"
                      />
                      <ThemedText style={styles.pokemonName}>
                        {pokemon.name}
                      </ThemedText>
                    </>
                  ) : (
                    <ThemedText style={styles.addText}>+</ThemedText>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.button, styles.compareButton]}
              onPress={fetchComparison}
              disabled={selectedPokemon.length < 2}
            >
              <ThemedText style={styles.buttonText}>Compare</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.button, styles.clearButton]}
              onPress={clearSelection}
            >
              <ThemedText style={styles.buttonText}>Clear</ThemedText>
            </Pressable>
          </View>
        </View>

        {comparisonData && comparisonData.pokemon.length >= 2 && (
          <View style={styles.comparisonContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Base Stats</ThemedText>

            {renderStatBar('HP', comparisonData.pokemon.map(p =>
              p.stats?.find(s => s.stat.name === 'hp')?.baseStat || 0
            ), comparisonData.pokemon)}
            {renderStatBar('Attack', comparisonData.pokemon.map(p =>
              p.stats?.find(s => s.stat.name === 'attack')?.baseStat || 0
            ), comparisonData.pokemon)}
            {renderStatBar('Defense', comparisonData.pokemon.map(p =>
              p.stats?.find(s => s.stat.name === 'defense')?.baseStat || 0
            ), comparisonData.pokemon)}
            {renderStatBar('Sp. Attack', comparisonData.pokemon.map(p =>
              p.stats?.find(s => s.stat.name === 'special-attack')?.baseStat || 0
            ), comparisonData.pokemon)}
            {renderStatBar('Sp. Defense', comparisonData.pokemon.map(p =>
              p.stats?.find(s => s.stat.name === 'special-defense')?.baseStat || 0
            ), comparisonData.pokemon)}
            {renderStatBar('Speed', comparisonData.pokemon.map(p =>
              p.stats?.find(s => s.stat.name === 'speed')?.baseStat || 0
            ), comparisonData.pokemon)}

            <ThemedText type="subtitle" style={styles.sectionTitle}>Physical Attributes</ThemedText>

            <View style={styles.attributeRow}>
              <ThemedText style={styles.attributeLabel}>Height</ThemedText>
              {comparisonData.pokemon.map((p, i) => (
                <ThemedText key={i} style={styles.attributeValue}>
                  {(p.height / 10).toFixed(1)}m
                </ThemedText>
              ))}
            </View>

            <View style={styles.attributeRow}>
              <ThemedText style={styles.attributeLabel}>Weight</ThemedText>
              {comparisonData.pokemon.map((p, i) => (
                <ThemedText key={i} style={styles.attributeValue}>
                  {(p.weight / 10).toFixed(1)}kg
                </ThemedText>
              ))}
            </View>

            <View style={styles.attributeRow}>
              <ThemedText style={styles.attributeLabel}>Base Exp</ThemedText>
              {comparisonData.pokemon.map((p, i) => (
                <ThemedText key={i} style={styles.attributeValue}>
                  {p.baseExperience || 'N/A'}
                </ThemedText>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {renderPokemonSelector()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  selectionContainer: {
    padding: 16,
  },
  selectedPokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  pokemonSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  pokemonImage: {
    width: '80%',
    height: '60%',
  },
  pokemonName: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  addText: {
    fontSize: 40,
    opacity: 0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  compareButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  comparisonContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  statRow: {
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    width: 100,
  },
  statBarsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  statBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPokemonImage: {
    width: 32,
    height: 32,
  },
  statBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  attributeLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  attributeValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    margin: 16,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  selectorItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  selectorImage: {
    width: 60,
    height: 60,
  },
  selectorName: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  selectorGrid: {
    paddingHorizontal: 12,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});