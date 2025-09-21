import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Pokemon, pokeAPI } from '@/services/api';

interface TypeEffectivenessTabProps {
  pokemon: Pokemon;
}


const typeColors: Record<string, string> = {
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

export function TypeEffectivenessTab({ pokemon }: TypeEffectivenessTabProps) {
  const [typeData, setTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const borderColor = '#333333';

  useEffect(() => {
    const fetchTypeData = async () => {
      if (!pokemon.types || pokemon.types.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const types = await pokeAPI.getTypes();
        const pokemonTypeData = types.filter(type =>
          pokemon.types?.some(pt => pt.type.name === type.name)
        );
        setTypeData(pokemonTypeData);
      } catch {
        setError('Failed to load type effectiveness data');
      } finally {
        setLoading(false);
      }
    };

    fetchTypeData();
  }, [pokemon.types]);

  const formatTypeName = (type: string) =>
    type.charAt(0).toUpperCase() + type.slice(1);

  const renderTypeTag = (typeName: string) => (
    <View
      key={typeName}
      style={[styles.typeTag, { backgroundColor: typeColors[typeName] || '#68A090' }]}
    >
      <ThemedText style={styles.typeTagText}>
        {formatTypeName(typeName)}
      </ThemedText>
    </View>
  );

  const calculateOverallEffectiveness = () => {
    if (!pokemon.types || pokemon.types.length === 0 || typeData.length === 0) {
      return { weakTo: [], resistsTo: [], immuneTo: [] };
    }

    const effectiveness: Record<string, number> = {};

    // Initialize all types with 1x effectiveness
    Object.keys(typeColors).forEach(type => {
      effectiveness[type] = 1;
    });

    // Calculate combined effectiveness for all Pokemon types
    pokemon.types.forEach(pokemonType => {
      const typeInfo = typeData.find(t => t.name === pokemonType.type.name);
      if (typeInfo && typeInfo.damageRelations) {
        const relations = typeInfo.damageRelations;

        // Apply weaknesses (takes double damage from)
        if (relations.double_damage_from) {
          relations.double_damage_from.forEach((type: any) => {
            effectiveness[type.name] *= 2;
          });
        }

        // Apply resistances (takes half damage from)
        if (relations.half_damage_from) {
          relations.half_damage_from.forEach((type: any) => {
            effectiveness[type.name] *= 0.5;
          });
        }

        // Apply immunities (takes no damage from)
        if (relations.no_damage_from) {
          relations.no_damage_from.forEach((type: any) => {
            effectiveness[type.name] = 0;
          });
        }
      }
    });

    const weakTo = Object.entries(effectiveness)
      .filter(([_, mult]) => mult > 1)
      .sort(([_, a], [__, b]) => b - a)
      .map(([type, mult]) => ({ type, multiplier: mult }));

    const resistsTo = Object.entries(effectiveness)
      .filter(([_, mult]) => mult > 0 && mult < 1)
      .sort(([_, a], [__, b]) => a - b)
      .map(([type, mult]) => ({ type, multiplier: mult }));

    const immuneTo = Object.entries(effectiveness)
      .filter(([_, mult]) => mult === 0)
      .map(([type, mult]) => ({ type, multiplier: mult }));

    return { weakTo, resistsTo, immuneTo };
  };

  const getAttackEffectiveness = () => {
    if (!pokemon.types || pokemon.types.length === 0 || typeData.length === 0) {
      return { superEffective: [], notVeryEffective: [], noEffect: [] };
    }

    const allSuperEffective = new Set<string>();
    const allNotVeryEffective = new Set<string>();
    const allNoEffect = new Set<string>();

    pokemon.types.forEach(pokemonType => {
      const typeInfo = typeData.find(t => t.name === pokemonType.type.name);
      if (typeInfo && typeInfo.damageRelations) {
        const relations = typeInfo.damageRelations;

        if (relations.double_damage_to) {
          relations.double_damage_to.forEach((type: any) => {
            allSuperEffective.add(type.name);
          });
        }

        if (relations.half_damage_to) {
          relations.half_damage_to.forEach((type: any) => {
            allNotVeryEffective.add(type.name);
          });
        }

        if (relations.no_damage_to) {
          relations.no_damage_to.forEach((type: any) => {
            allNoEffect.add(type.name);
          });
        }
      }
    });

    return {
      superEffective: Array.from(allSuperEffective),
      notVeryEffective: Array.from(allNotVeryEffective),
      noEffect: Array.from(allNoEffect),
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={textColor} />
        <ThemedText style={styles.loadingText}>Loading type effectiveness...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  if (!pokemon.types || pokemon.types.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No type data available</ThemedText>
      </View>
    );
  }

  const { weakTo, resistsTo, immuneTo } = calculateOverallEffectiveness();
  const { superEffective, notVeryEffective, noEffect } = getAttackEffectiveness();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Pokemon Types</ThemedText>
          <View style={styles.typesContainer}>
            {pokemon.types.map(pokemonType =>
              renderTypeTag(pokemonType.type.name)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Defensive Effectiveness</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            How much damage this Pokemon takes from different types
          </ThemedText>

          {weakTo.length > 0 && (
            <View style={[styles.effectivenessCard, { borderColor }]}>
              <ThemedText style={[styles.effectivenessTitle, { color: '#D32F2F' }]}>
                Weak To ({weakTo.length > 1 ? 'Takes Extra Damage' : 'Takes 2x Damage'})
              </ThemedText>
              <View style={styles.typesGrid}>
                {weakTo.map(({ type, multiplier }) => (
                  <View key={type} style={styles.typeWithMultiplier}>
                    {renderTypeTag(type)}
                    <ThemedText style={[styles.multiplierText, { color: '#D32F2F' }]}>
                      {multiplier}x
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {resistsTo.length > 0 && (
            <View style={[styles.effectivenessCard, { borderColor }]}>
              <ThemedText style={[styles.effectivenessTitle, { color: '#388E3C' }]}>
                Resists (Takes Reduced Damage)
              </ThemedText>
              <View style={styles.typesGrid}>
                {resistsTo.map(({ type, multiplier }) => (
                  <View key={type} style={styles.typeWithMultiplier}>
                    {renderTypeTag(type)}
                    <ThemedText style={[styles.multiplierText, { color: '#388E3C' }]}>
                      {multiplier}x
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {immuneTo.length > 0 && (
            <View style={[styles.effectivenessCard, { borderColor }]}>
              <ThemedText style={[styles.effectivenessTitle, { color: '#9E9E9E' }]}>
                Immune To (Takes No Damage)
              </ThemedText>
              <View style={styles.typesGrid}>
                {immuneTo.map(({ type }) => (
                  <View key={type} style={styles.typeWithMultiplier}>
                    {renderTypeTag(type)}
                    <ThemedText style={[styles.multiplierText, { color: '#9E9E9E' }]}>
                      0x
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Offensive Effectiveness</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            How much damage this Pokemon&apos;s type moves deal to other types
          </ThemedText>

          {superEffective.length > 0 && (
            <View style={[styles.effectivenessCard, { borderColor }]}>
              <ThemedText style={[styles.effectivenessTitle, { color: '#388E3C' }]}>
                Super Effective Against (Deals 2x Damage)
              </ThemedText>
              <View style={styles.typesGrid}>
                {superEffective.map(type => renderTypeTag(type))}
              </View>
            </View>
          )}

          {notVeryEffective.length > 0 && (
            <View style={[styles.effectivenessCard, { borderColor }]}>
              <ThemedText style={[styles.effectivenessTitle, { color: '#F57C00' }]}>
                Not Very Effective Against (Deals 0.5x Damage)
              </ThemedText>
              <View style={styles.typesGrid}>
                {notVeryEffective.map(type => renderTypeTag(type))}
              </View>
            </View>
          )}

          {noEffect.length > 0 && (
            <View style={[styles.effectivenessCard, { borderColor }]}>
              <ThemedText style={[styles.effectivenessTitle, { color: '#9E9E9E' }]}>
                No Effect Against (Deals 0x Damage)
              </ThemedText>
              <View style={styles.typesGrid}>
                {noEffect.map(type => renderTypeTag(type))}
              </View>
            </View>
          )}
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectivenessCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  effectivenessTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeWithMultiplier: {
    alignItems: 'center',
    marginBottom: 4,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 2,
  },
  typeTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  multiplierText: {
    fontSize: 10,
    fontWeight: 'bold',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});