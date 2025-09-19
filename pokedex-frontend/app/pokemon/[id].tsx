import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TabView, Tab } from '@/components/ui/tab-view';
import { OverviewTab } from '@/components/pokemon/overview-tab';
import { StatsTab } from '@/components/pokemon/stats-tab';
import { AbilitiesTab } from '@/components/pokemon/abilities-tab';
import { TypeEffectivenessTab } from '@/components/pokemon/type-effectiveness-tab';
import { EvolutionTab } from '@/components/pokemon/evolution-tab';
import { usePokemonDetails } from '@/hooks/use-pokemon';


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

  const backgroundColor = '#000000';
  const textColor = '#FFFFFF';
  const borderColor = '#333333';

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

  const tabs: Tab[] = [
    {
      key: 'overview',
      title: 'Overview',
      content: <OverviewTab pokemon={pokemon} />,
    },
    {
      key: 'stats',
      title: 'Stats',
      content: <StatsTab pokemon={pokemon} />,
    },
    {
      key: 'abilities',
      title: 'Abilities',
      content: <AbilitiesTab pokemon={pokemon} />,
    },
    {
      key: 'evolution',
      title: 'Evolution',
      content: <EvolutionTab pokemon={pokemon} />,
    },
    {
      key: 'types',
      title: 'Type Chart',
      content: <TypeEffectivenessTab pokemon={pokemon} />,
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: formatName(pokemon.name),
          headerStyle: { backgroundColor: primaryColor },
          headerTintColor: '#fff',
        }}
      />

      <View style={[styles.header, { backgroundColor: primaryColor + '20' }]}>
        <View style={styles.headerContent}>
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

          <View style={styles.infoContainer}>
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
        </View>
      </View>

      <TabView tabs={tabs} initialTab="overview" />
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spriteContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  sprite: {
    width: '100%',
    height: '100%',
  },
  spritePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  pokemonId: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  legendaryBadge: {
    backgroundColor: '#FFD700',
  },
  mythicalBadge: {
    backgroundColor: '#FF69B4',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});