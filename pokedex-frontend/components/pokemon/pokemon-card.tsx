import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Pokemon } from '@/services/api';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress?: () => void;
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

export function PokemonCard({ pokemon, onPress }: PokemonCardProps) {
  const backgroundColor = '#000000';
  const borderColor = '#333333';
  const textColor = '#FFFFFF';

  const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor,
          borderColor,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {pokemon.spriteFrontDefault ? (
          <Image
            source={pokemon.spriteFrontDefault}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
      </View>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.id}>{formatId(pokemon.id)}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
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
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    minHeight: 100,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  id: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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