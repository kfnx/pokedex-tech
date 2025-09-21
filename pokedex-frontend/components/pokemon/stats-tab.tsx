import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Pokemon } from '@/services/api';

interface StatsTabProps {
  pokemon: Pokemon;
}

const statNames: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

const statDescriptions: Record<string, string> = {
  hp: 'Health Points - determines how much damage a Pokemon can take',
  attack: 'Physical Attack - affects the power of physical moves',
  defense: 'Physical Defense - reduces damage from physical moves',
  'special-attack': 'Special Attack - affects the power of special moves',
  'special-defense': 'Special Defense - reduces damage from special moves',
  speed: 'Speed - determines turn order in battle',
};

export function StatsTab({ pokemon }: StatsTabProps) {
  const borderColor = '#333333';

  const getStatColor = (value: number) => {
    if (value >= 150) return '#4CAF50'; // Green
    if (value >= 100) return '#8BC34A'; // Light Green
    if (value >= 75) return '#FFC107'; // Yellow
    if (value >= 50) return '#FF9800'; // Orange
    if (value >= 25) return '#FF5722'; // Red Orange
    return '#F44336'; // Red
  };

  const getStatRating = (value: number) => {
    if (value >= 150) return 'Excellent';
    if (value >= 120) return 'Very High';
    if (value >= 90) return 'High';
    if (value >= 70) return 'Good';
    if (value >= 50) return 'Average';
    if (value >= 30) return 'Low';
    return 'Very Low';
  };

  if (!pokemon.stats || pokemon.stats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No stats data available</ThemedText>
        </View>
      </View>
    );
  }

  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.baseStat, 0);
  const averageStat = Math.round(totalStats / pokemon.stats.length);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Base Stats</ThemedText>
          <View style={[styles.statsCard, { borderColor }]}>
            {pokemon.stats.map((pokemonStat) => {
              const statPercentage = Math.min((pokemonStat.baseStat / 255) * 100, 100);
              const statColor = getStatColor(pokemonStat.baseStat);
              return (
                <View key={pokemonStat.stat.id} style={styles.statRow}>
                  <View style={styles.statInfo}>
                    <ThemedText style={styles.statName}>
                      {statNames[pokemonStat.stat.name] || pokemonStat.stat.name}
                    </ThemedText>
                    <ThemedText style={styles.statDescription}>
                      {statDescriptions[pokemonStat.stat.name] || 'No description available'}
                    </ThemedText>
                  </View>
                  <View style={styles.statValueContainer}>
                    <ThemedText style={[styles.statValue, { color: statColor }]}>
                      {pokemonStat.baseStat}
                    </ThemedText>
                    <ThemedText style={styles.statRating}>
                      {getStatRating(pokemonStat.baseStat)}
                    </ThemedText>
                  </View>
                  <View style={styles.statBarContainer}>
                    <View
                      style={[
                        styles.statBar,
                        {
                          width: `${statPercentage}%`,
                          backgroundColor: statColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Stat Summary</ThemedText>
          <View style={[styles.summaryCard, { borderColor }]}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Total Base Stats</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: getStatColor(totalStats / 6) }]}>
                {totalStats}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Average Stat</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: getStatColor(averageStat) }]}>
                {averageStat}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Highest Stat</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {(() => {
                  const maxStat = pokemon.stats.reduce((max, stat) =>
                    stat.baseStat > max.baseStat ? stat : max
                  );
                  return `${statNames[maxStat.stat.name]} (${maxStat.baseStat})`;
                })()}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Lowest Stat</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {(() => {
                  const minStat = pokemon.stats.reduce((min, stat) =>
                    stat.baseStat < min.baseStat ? stat : min
                  );
                  return `${statNames[minStat.stat.name]} (${minStat.baseStat})`;
                })()}
              </ThemedText>
            </View>
          </View>
        </View>

        {pokemon.stats.some(stat => stat.effort > 0) && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Effort Values (EVs)</ThemedText>
            <View style={[styles.statsCard, { borderColor }]}>
              <ThemedText style={styles.evDescription}>
                Effort Values gained when defeating this Pokemon:
              </ThemedText>
              {pokemon.stats
                .filter(stat => stat.effort > 0)
                .map((pokemonStat) => (
                  <View key={pokemonStat.stat.id} style={styles.evRow}>
                    <ThemedText style={styles.evStatName}>
                      {statNames[pokemonStat.stat.name]}
                    </ThemedText>
                    <ThemedText style={styles.evValue}>
                      +{pokemonStat.effort} EV{pokemonStat.effort > 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                ))}
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
  statsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  statRow: {
    marginBottom: 20,
  },
  statInfo: {
    marginBottom: 8,
  },
  statName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statDescription: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
  statValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statRating: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  statBarContainer: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 6,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  evDescription: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  evRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  evStatName: {
    fontSize: 14,
  },
  evValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#388E3C',
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