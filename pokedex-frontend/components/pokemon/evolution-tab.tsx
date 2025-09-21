import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pokemon, pokeAPI } from '@/services/api';

interface EvolutionTabProps {
  pokemon: Pokemon;
}

interface EvolutionData {
  id: number;
  name: string;
  sprite: string | null;
  level?: number;
  method?: string;
  item?: string;
  isCurrentPokemon?: boolean;
}

// Common evolution methods and their descriptions
const evolutionMethods: Record<string, string> = {
  'level-up': 'Level up',
  'trade': 'Trade',
  'use-item': 'Use item',
  'shed': 'Level up with empty slot',
  'spin': 'Spin around holding item',
  'tower-of-darkness': 'Tower of Darkness',
  'tower-of-waters': 'Tower of Waters',
  'three-critical-hits': 'Land 3 critical hits in battle',
  'take-damage': 'Take damage in battle',
  'other': 'Special condition',
};

// Hardcoded evolution chains for common Pokemon (in a real app, this would come from the API)
const evolutionChains: Record<number, EvolutionData[]> = {
  // Bulbasaur line
  1: [
    { id: 1, name: 'Bulbasaur', sprite: null },
    { id: 2, name: 'Ivysaur', sprite: null, level: 16, method: 'level-up' },
    { id: 3, name: 'Venusaur', sprite: null, level: 32, method: 'level-up' },
  ],
  2: [
    { id: 1, name: 'Bulbasaur', sprite: null },
    { id: 2, name: 'Ivysaur', sprite: null, level: 16, method: 'level-up' },
    { id: 3, name: 'Venusaur', sprite: null, level: 32, method: 'level-up' },
  ],
  3: [
    { id: 1, name: 'Bulbasaur', sprite: null },
    { id: 2, name: 'Ivysaur', sprite: null, level: 16, method: 'level-up' },
    { id: 3, name: 'Venusaur', sprite: null, level: 32, method: 'level-up' },
  ],
  // Charmander line
  4: [
    { id: 4, name: 'Charmander', sprite: null },
    { id: 5, name: 'Charmeleon', sprite: null, level: 16, method: 'level-up' },
    { id: 6, name: 'Charizard', sprite: null, level: 36, method: 'level-up' },
  ],
  5: [
    { id: 4, name: 'Charmander', sprite: null },
    { id: 5, name: 'Charmeleon', sprite: null, level: 16, method: 'level-up' },
    { id: 6, name: 'Charizard', sprite: null, level: 36, method: 'level-up' },
  ],
  6: [
    { id: 4, name: 'Charmander', sprite: null },
    { id: 5, name: 'Charmeleon', sprite: null, level: 16, method: 'level-up' },
    { id: 6, name: 'Charizard', sprite: null, level: 36, method: 'level-up' },
  ],
  // Squirtle line
  7: [
    { id: 7, name: 'Squirtle', sprite: null },
    { id: 8, name: 'Wartortle', sprite: null, level: 16, method: 'level-up' },
    { id: 9, name: 'Blastoise', sprite: null, level: 36, method: 'level-up' },
  ],
  8: [
    { id: 7, name: 'Squirtle', sprite: null },
    { id: 8, name: 'Wartortle', sprite: null, level: 16, method: 'level-up' },
    { id: 9, name: 'Blastoise', sprite: null, level: 36, method: 'level-up' },
  ],
  9: [
    { id: 7, name: 'Squirtle', sprite: null },
    { id: 8, name: 'Wartortle', sprite: null, level: 16, method: 'level-up' },
    { id: 9, name: 'Blastoise', sprite: null, level: 36, method: 'level-up' },
  ],
  // Caterpie line
  10: [
    { id: 10, name: 'Caterpie', sprite: null },
    { id: 11, name: 'Metapod', sprite: null, level: 7, method: 'level-up' },
    { id: 12, name: 'Butterfree', sprite: null, level: 10, method: 'level-up' },
  ],
  11: [
    { id: 10, name: 'Caterpie', sprite: null },
    { id: 11, name: 'Metapod', sprite: null, level: 7, method: 'level-up' },
    { id: 12, name: 'Butterfree', sprite: null, level: 10, method: 'level-up' },
  ],
  12: [
    { id: 10, name: 'Caterpie', sprite: null },
    { id: 11, name: 'Metapod', sprite: null, level: 7, method: 'level-up' },
    { id: 12, name: 'Butterfree', sprite: null, level: 10, method: 'level-up' },
  ],
  // Pikachu line
  25: [
    { id: 172, name: 'Pichu', sprite: null, method: 'high-friendship' },
    { id: 25, name: 'Pikachu', sprite: null },
    { id: 26, name: 'Raichu', sprite: null, item: 'Thunder Stone', method: 'use-item' },
  ],
  26: [
    { id: 172, name: 'Pichu', sprite: null, method: 'high-friendship' },
    { id: 25, name: 'Pikachu', sprite: null },
    { id: 26, name: 'Raichu', sprite: null, item: 'Thunder Stone', method: 'use-item' },
  ],
  172: [
    { id: 172, name: 'Pichu', sprite: null },
    { id: 25, name: 'Pikachu', sprite: null, method: 'high-friendship' },
    { id: 26, name: 'Raichu', sprite: null, item: 'Thunder Stone', method: 'use-item' },
  ],
};

export function EvolutionTab({ pokemon }: EvolutionTabProps) {
  const [evolutionChain, setEvolutionChain] = useState<EvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pokemonData, setPokemonData] = useState<Record<number, Pokemon>>({});

  const borderColor = '#333333';
  const textColor = '#FFFFFF';
  const methodBadgeColor = '#1A237E';
  const methodTextColor = '#BBDEFB';

  useEffect(() => {
    const loadEvolutionData = async () => {
      setLoading(true);

      // Get evolution chain for this Pokemon
      const chain = evolutionChains[pokemon.id];
      if (!chain) {
        setLoading(false);
        return;
      }

      // Mark current Pokemon
      const chainWithCurrent = chain.map(evo => ({
        ...evo,
        isCurrentPokemon: evo.id === pokemon.id,
      }));

      setEvolutionChain(chainWithCurrent);

      // Fetch Pokemon data for sprites
      try {
        const dataPromises = chain.map(async (evo) => {
          try {
            const pokemonDetails = await pokeAPI.getPokemonDetails(evo.id);
            return { id: evo.id, data: pokemonDetails };
          } catch (error) {
            console.warn(`Failed to fetch Pokemon ${evo.id}:`, error);
            return { id: evo.id, data: null };
          }
        });

        const results = await Promise.all(dataPromises);
        const dataMap: Record<number, Pokemon> = {};

        results.forEach(({ id, data }) => {
          if (data) {
            dataMap[id] = data;
          }
        });

        setPokemonData(dataMap);
      } catch (error) {
        console.error('Failed to load evolution Pokemon data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvolutionData();
  }, [pokemon.id]);

  const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  const handlePokemonPress = (pokemonId: number) => {
    if (pokemonId !== pokemon.id) {
      router.push(`/pokemon/${pokemonId}`);
    }
  };

  const renderEvolutionMethod = (evo: EvolutionData, index: number) => {
    if (index === 0) return null; // First Pokemon doesn't have evolution method

    const method = evo.method ? evolutionMethods[evo.method] || evo.method : 'Unknown';
    let description = method;

    if (evo.level) {
      description = `Level ${evo.level}`;
    } else if (evo.item) {
      description = evo.item;
    }

    return (
      <View style={styles.evolutionMethod}>
        <IconSymbol name="arrow.down" size={24} color={textColor} />
        <ThemedText style={styles.methodText}>{description}</ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={textColor} />
        <ThemedText style={styles.loadingText}>Loading evolution data...</ThemedText>
      </View>
    );
  }

  if (evolutionChain.length === 0) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.noEvolutionCard, { borderColor }]}>
            <ThemedText style={styles.noEvolutionTitle}>No Evolution Data</ThemedText>
            <ThemedText style={styles.noEvolutionText}>
              This Pokemon&apos;s evolution information is not currently available, or it may not evolve.
            </ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>About Pokemon Evolution</ThemedText>
            <View style={[styles.infoCard, { borderColor }]}>
              <ThemedText style={styles.infoText}>
                Pokemon evolution is a process where Pokemon transform into different species. Common evolution methods include:
              </ThemedText>
              <View style={styles.infoList}>
                <ThemedText style={styles.infoItem}>• Level up - Reaching a certain level</ThemedText>
                <ThemedText style={styles.infoItem}>• Use item - Using evolution stones or other items</ThemedText>
                <ThemedText style={styles.infoItem}>• Trade - Trading with another trainer</ThemedText>
                <ThemedText style={styles.infoItem}>• Friendship - High friendship levels</ThemedText>
                <ThemedText style={styles.infoItem}>• Special conditions - Unique requirements</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Evolution Chain</ThemedText>

          <View style={styles.evolutionChain}>
            {evolutionChain.map((evo, index) => {
              const pokemonDetails = pokemonData[evo.id];
              return (
                <React.Fragment key={evo.id}>
                  {renderEvolutionMethod(evo, index)}

                  <Pressable
                    style={[
                      styles.evolutionStage,
                      { borderColor },
                      evo.isCurrentPokemon && styles.currentStage,
                      evo.isCurrentPokemon && { borderColor: '#4CAF50' },
                    ]}
                    onPress={() => handlePokemonPress(evo.id)}
                    disabled={evo.isCurrentPokemon}
                  >
                    <View style={styles.spriteContainer}>
                      {pokemonDetails?.spriteFrontDefault ? (
                        <Image
                          source={pokemonDetails.spriteFrontDefault}
                          style={styles.sprite}
                          contentFit="contain"
                        />
                      ) : (
                        <View style={[styles.sprite, styles.spritePlaceholder]} />
                      )}
                    </View>

                    <ThemedText style={styles.pokemonName}>
                      {formatName(evo.name)}
                    </ThemedText>

                    <ThemedText style={styles.pokemonId}>
                      #{evo.id.toString().padStart(3, '0')}
                    </ThemedText>

                    {evo.isCurrentPokemon && (
                      <View style={styles.currentBadge}>
                        <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
                      </View>
                    )}
                  </Pressable>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Evolution Requirements</ThemedText>
          <View style={[styles.requirementsCard, { borderColor }]}>
            {evolutionChain.slice(1).map((evo, index) => {
              const prevEvo = evolutionChain[index];
              return (
                <View key={evo.id} style={styles.requirementItem}>
                  <ThemedText style={styles.requirementFrom}>
                    {formatName(prevEvo.name)}
                  </ThemedText>
                  <ThemedText style={styles.requirementArrow}>→</ThemedText>
                  <ThemedText style={styles.requirementTo}>
                    {formatName(evo.name)}
                  </ThemedText>
                  <View style={[styles.requirementMethodBadge, { backgroundColor: methodBadgeColor }]}>
                    <ThemedText style={[styles.requirementMethodText, { color: methodTextColor }]}>
                      {evo.level ? `Level ${evo.level}` :
                       evo.item ? `Use ${evo.item}` :
                       evo.method ? evolutionMethods[evo.method] || evo.method :
                       'Unknown method'}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Evolution Tips</ThemedText>
          <View style={[styles.infoCard, { borderColor }]}>
            <ThemedText style={styles.infoText}>
              • Pokemon typically keep their learned moves when evolving
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Some Pokemon learn different moves at different evolution stages
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Evolution usually increases base stats significantly
            </ThemedText>
            <ThemedText style={styles.infoText}>
              • Some Pokemon may learn moves faster in unevolved forms
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  evolutionChain: {
    alignItems: 'center',
  },
  evolutionMethod: {
    alignItems: 'center',
    marginVertical: 8,
    gap: 4,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  evolutionStage: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    minWidth: 120,
  },
  currentStage: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  spriteContainer: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  sprite: {
    width: '100%',
    height: '100%',
  },
  spritePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  pokemonName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  pokemonId: {
    fontSize: 12,
    opacity: 0.6,
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requirementsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  requirementFrom: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  requirementArrow: {
    fontSize: 16,
    marginHorizontal: 8,
    opacity: 0.6,
  },
  requirementTo: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  requirementMethodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  requirementMethodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noEvolutionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  noEvolutionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noEvolutionText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 8,
  },
  infoList: {
    marginTop: 8,
  },
  infoItem: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
});