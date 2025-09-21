import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { Pokemon } from '@/services/api';
import { AudioPlayer } from '@/components/pokemon/audio-player';

interface OverviewTabProps {
  pokemon: Pokemon;
}

export function OverviewTab({ pokemon }: OverviewTabProps) {
  const borderColor = '#333333';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Information</ThemedText>
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
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Order</ThemedText>
              <ThemedText style={styles.infoValue}>{pokemon.order || 'N/A'}</ThemedText>
            </View>
            {pokemon.species && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Generation</ThemedText>
                <ThemedText style={styles.infoValue}>{pokemon.species.generation}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {pokemon.species && (pokemon.species.isLegendary || pokemon.species.isMythical) && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Special Classification</ThemedText>
            <View style={styles.specialContainer}>
              {pokemon.species.isLegendary && (
                <View style={[styles.specialBadge, styles.legendaryBadge]}>
                  <ThemedText style={styles.specialBadgeText}>LEGENDARY</ThemedText>
                  <ThemedText style={styles.specialDescription}>
                    Legendary Pokemon are rare and powerful creatures with extraordinary abilities.
                  </ThemedText>
                </View>
              )}
              {pokemon.species.isMythical && (
                <View style={[styles.specialBadge, styles.mythicalBadge]}>
                  <ThemedText style={styles.specialBadgeText}>MYTHICAL</ThemedText>
                  <ThemedText style={styles.specialDescription}>
                    Mythical Pokemon are extremely rare and often associated with legends and myths.
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {(pokemon.spriteFrontShiny || pokemon.spriteBackDefault || pokemon.spriteBackShiny) && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Sprite Gallery</ThemedText>
            <View style={styles.spritesContainer}>
              <View style={styles.spriteRow}>
                <View style={styles.spriteItem}>
                  <ThemedText style={styles.spriteLabel}>Normal (Front)</ThemedText>
                  <Image
                    source={pokemon.spriteFrontDefault}
                    style={styles.sprite}
                    contentFit="contain"
                  />
                </View>
                {pokemon.spriteBackDefault && (
                  <View style={styles.spriteItem}>
                    <ThemedText style={styles.spriteLabel}>Normal (Back)</ThemedText>
                    <Image
                      source={pokemon.spriteBackDefault}
                      style={styles.sprite}
                      contentFit="contain"
                    />
                  </View>
                )}
              </View>

              {(pokemon.spriteFrontShiny || pokemon.spriteBackShiny) && (
                <View style={styles.spriteRow}>
                  {pokemon.spriteFrontShiny && (
                    <View style={styles.spriteItem}>
                      <ThemedText style={styles.spriteLabel}>Shiny (Front)</ThemedText>
                      <Image
                        source={pokemon.spriteFrontShiny}
                        style={styles.sprite}
                        contentFit="contain"
                      />
                    </View>
                  )}
                  {pokemon.spriteBackShiny && (
                    <View style={styles.spriteItem}>
                      <ThemedText style={styles.spriteLabel}>Shiny (Back)</ThemedText>
                      <Image
                        source={pokemon.spriteBackShiny}
                        style={styles.sprite}
                        contentFit="contain"
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {pokemon.cries && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Pokemon Cries</ThemedText>
            <View style={styles.audioContainer}>
              <View style={styles.audioRow}>
                {pokemon.cries.latest && (
                  <View style={styles.audioItem}>
                    <AudioPlayer
                      audioUrl={pokemon.cries.latest}
                      label="Latest Cry"
                    />
                  </View>
                )}
                {pokemon.cries.legacy && (
                  <View style={styles.audioItem}>
                    <AudioPlayer
                      audioUrl={pokemon.cries.legacy}
                      label="Legacy Cry"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
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
  specialContainer: {
    gap: 12,
  },
  specialBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  legendaryBadge: {
    backgroundColor: '#FFD700',
  },
  mythicalBadge: {
    backgroundColor: '#FF69B4',
  },
  specialBadgeText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  specialDescription: {
    color: '#1A1A1A',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  spritesContainer: {
    gap: 16,
  },
  spriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  spriteItem: {
    flex: 1,
    alignItems: 'center',
  },
  spriteLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
    opacity: 0.7,
  },
  sprite: {
    width: 100,
    height: 100,
  },
  audioContainer: {
    gap: 8,
  },
  audioRow: {
    flexDirection: 'row',
    gap: 8,
  },
  audioItem: {
    flex: 1,
  },
});