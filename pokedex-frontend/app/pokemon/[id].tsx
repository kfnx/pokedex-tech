import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePokemonDetails } from '@/hooks/use-pokemon';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width: screenWidth } = Dimensions.get('window');

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

const statNames: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = parseInt(id as string);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');

  const { pokemon, loading, error } = usePokemonDetails(pokemonId);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={textColor} />
        <ThemedText style={styles.loadingText}>Loading Pokemon...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !pokemon) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: 'Error' }} />
        <ThemedText style={styles.errorText}>{error || 'Pokemon not found'}</ThemedText>
      </ThemedView>
    );
  }

  const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;
  const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  const primaryType = pokemon.types?.[0]?.type.name || 'normal';
  const primaryColor = typeColors[primaryType];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: formatName(pokemon.name),
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: primaryColor + '20' }]}>
          <View style={styles.spriteContainer}>
            {pokemon.spriteFrontDefault ? (
              <Image
                source={pokemon.spriteFrontDefault}
                style={styles.sprite}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <View style={[styles.sprite, styles.spritePlaceholder]} />
            )}
          </View>

          <ThemedText style={styles.pokemonId}>{formatId(pokemon.id)}</ThemedText>
          <ThemedText type="title" style={styles.pokemonName}>
            {formatName(pokemon.name)}
          </ThemedText>

          {pokemon.types && (
            <View style={styles.typesContainer}>
              {pokemon.types.map((pokemonType) => (
                <View
                  key={pokemonType.type.id}
                  style={[
                    styles.typeTag,
                    { backgroundColor: typeColors[pokemonType.type.name] || '#68A090' },
                  ]}
                >
                  <ThemedText style={styles.typeText}>
                    {pokemonType.type.name.toUpperCase()}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {pokemon.species && (
            <View style={styles.badges}>
              {pokemon.species.isLegendary && (
                <View style={[styles.badge, styles.legendaryBadge]}>
                  <ThemedText style={styles.badgeText}>LEGENDARY</ThemedText>
                </View>
              )}
              {pokemon.species.isMythical && (
                <View style={[styles.badge, styles.mythicalBadge]}>
                  <ThemedText style={styles.badgeText}>MYTHICAL</ThemedText>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Info</ThemedText>
            <View style={[styles.infoCard, { borderColor }]}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Height</ThemedText>
                <ThemedText style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Weight</ThemedText>
                <ThemedText style={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</ThemedText>
              </View>
              {pokemon.baseExperience && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Base Experience</ThemedText>
                  <ThemedText style={styles.infoValue}>{pokemon.baseExperience}</ThemedText>
                </View>
              )}
              {pokemon.species && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Generation</ThemedText>
                  <ThemedText style={styles.infoValue}>{pokemon.species.generation}</ThemedText>
                </View>
              )}
            </View>
          </View>

          {pokemon.stats && pokemon.stats.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Base Stats</ThemedText>
              <View style={[styles.statsCard, { borderColor }]}>
                {pokemon.stats.map((pokemonStat) => {
                  const statPercentage = (pokemonStat.baseStat / 255) * 100;
                  return (
                    <View key={pokemonStat.stat.id} style={styles.statRow}>
                      <ThemedText style={styles.statName}>
                        {statNames[pokemonStat.stat.name] || pokemonStat.stat.name}
                      </ThemedText>
                      <ThemedText style={styles.statValue}>{pokemonStat.baseStat}</ThemedText>
                      <View style={styles.statBarContainer}>
                        <View
                          style={[
                            styles.statBar,
                            {
                              width: `${statPercentage}%`,
                              backgroundColor: statPercentage > 50 ? '#4CAF50' : '#FFC107',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {pokemon.abilities && pokemon.abilities.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Abilities</ThemedText>
              <View style={styles.abilitiesContainer}>
                {pokemon.abilities.map((pokemonAbility) => (
                  <View
                    key={pokemonAbility.ability.id}
                    style={[
                      styles.abilityCard,
                      { borderColor, backgroundColor: pokemonAbility.isHidden ? '#FFE082' : backgroundColor },
                    ]}
                  >
                    <ThemedText style={styles.abilityName}>
                      {formatName(pokemonAbility.ability.name.replace('-', ' '))}
                    </ThemedText>
                    {pokemonAbility.isHidden && (
                      <ThemedText style={styles.hiddenLabel}>Hidden</ThemedText>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {pokemon.spriteFrontShiny && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Shiny Form</ThemedText>
              <View style={styles.shinyContainer}>
                <Image
                  source={pokemon.spriteFrontShiny}
                  style={styles.shinySprite}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  spriteContainer: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  sprite: {
    width: '100%',
    height: '100%',
  },
  spritePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  pokemonId: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legendaryBadge: {
    backgroundColor: '#FFD700',
  },
  mythicalBadge: {
    backgroundColor: '#FF69B4',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statName: {
    fontSize: 14,
    width: 70,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
    marginRight: 12,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  abilityName: {
    fontSize: 14,
  },
  hiddenLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  shinyContainer: {
    alignItems: 'center',
  },
  shinySprite: {
    width: 120,
    height: 120,
  },
});