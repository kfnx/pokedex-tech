import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Pokemon } from '@/services/api';

interface AbilitiesTabProps {
  pokemon: Pokemon;
}

// Common ability descriptions - in a real app, this would come from the API
const abilityDescriptions: Record<string, string> = {
  'overgrow': 'Boosts Grass-type moves by 50% when HP is below 1/3.',
  'chlorophyll': 'Doubles Speed stat in sunny weather.',
  'blaze': 'Boosts Fire-type moves by 50% when HP is below 1/3.',
  'solar-power': 'Increases Special Attack by 50% in sunny weather, but loses 1/8 HP each turn.',
  'torrent': 'Boosts Water-type moves by 50% when HP is below 1/3.',
  'rain-dish': 'Restores 1/16 HP each turn in rainy weather.',
  'shield-dust': 'Prevents additional effects of moves from affecting this Pokemon.',
  'run-away': 'Guarantees escape from wild Pokemon encounters.',
  'shed-skin': 'Has a 30% chance of curing status conditions each turn.',
  'compound-eyes': 'Increases move accuracy by 30%.',
  'swarm': 'Boosts Bug-type moves by 50% when HP is below 1/3.',
  'keen-eye': 'Prevents accuracy reduction.',
  'tangled-feet': 'Doubles evasion when confused.',
  'big-pecks': 'Prevents Defense stat reduction.',
  'guts': 'Increases Attack by 50% when suffering from a status condition.',
  'hustle': 'Increases Attack by 50% but decreases physical move accuracy by 20%.',
  'cute-charm': 'Has a 30% chance of infatuating attackers that make direct contact.',
  'magic-guard': 'Only takes damage from direct attacks.',
  'friend-guard': 'Reduces damage to allies by 25% in Double and Triple Battles.',
  'healer': 'Has a 30% chance of curing allies\' status conditions each turn.',
  'synchronize': 'Passes poison, burn, or paralysis to the Pokemon that inflicted it.',
  'inner-focus': 'Prevents flinching.',
  'early-bird': 'Reduces sleep duration by half.',
  'flame-body': 'Has a 30% chance of burning attackers that make direct contact.',
  'static': 'Has a 30% chance of paralyzing attackers that make direct contact.',
  'volt-absorb': 'Restores 1/4 HP when hit by Electric-type moves.',
  'water-absorb': 'Restores 1/4 HP when hit by Water-type moves.',
  'oblivious': 'Prevents infatuation and taunting.',
  'cloud-nine': 'Eliminates weather effects.',
  'levitate': 'Grants immunity to Ground-type moves.',
  'effect-spore': 'Has a 30% chance of inflicting poison, paralysis, or sleep on attackers.',
  'poison-point': 'Has a 30% chance of poisoning attackers that make direct contact.',
  'serene-grace': 'Doubles the chance of additional effects occurring.',
  'swift-swim': 'Doubles Speed stat in rainy weather.',
  'natural-cure': 'Cures status conditions when switching out.',
  'lightning-rod': 'Draws Electric-type moves to this Pokemon and boosts Special Attack.',
  'rock-head': 'Prevents recoil damage.',
  'drought': 'Summons sunny weather.',
  'arena-trap': 'Prevents opponents from escaping.',
  'vital-spirit': 'Prevents sleep.',
  'white-smoke': 'Prevents stat reduction.',
  'pure-power': 'Doubles Attack stat.',
  'shell-armor': 'Prevents critical hits.',
  'air-lock': 'Eliminates weather effects.',
  'intimidate': 'Lowers opponents\' Attack by one stage upon entering battle.',
  'shadow-tag': 'Prevents opponents from escaping.',
  'rough-skin': 'Damages attackers that make direct contact.',
  'wonder-guard': 'Only super-effective moves can deal damage.',
  'pressure': 'Causes opponents to use 2 PP instead of 1.',
  'thick-fat': 'Halves damage from Fire and Ice-type moves.',
  'huge-power': 'Doubles Attack stat.',
  'insomnia': 'Prevents sleep.',
  'color-change': 'Changes type to match the type of the last move used against it.',
  'immunity': 'Prevents poison.',
  'flash-fire': 'Boosts Fire-type moves by 50% when hit by Fire-type moves.',
  'shield-dust': 'Blocks additional effects of attacks.',
};

export function AbilitiesTab({ pokemon }: AbilitiesTabProps) {
  const borderColor = '#333333';
  const backgroundColor = '#000000';
  const cardBgColor = '#1a1a1a';
  const hiddenCardBgColor = '#2D1B00';

  const formatName = (name: string) =>
    name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (!pokemon.abilities || pokemon.abilities.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No abilities data available</ThemedText>
        </View>
      </View>
    );
  }

  const normalAbilities = pokemon.abilities.filter(ability => !ability.isHidden);
  const hiddenAbilities = pokemon.abilities.filter(ability => ability.isHidden);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {normalAbilities.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Normal Abilities</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              These abilities can be found on this Pokemon in normal encounters.
            </ThemedText>
            <View style={styles.abilitiesContainer}>
              {normalAbilities.map((pokemonAbility) => (
                <View
                  key={pokemonAbility.ability.id}
                  style={[styles.abilityCard, { borderColor, backgroundColor: cardBgColor }]}
                >
                  <View style={styles.abilityHeader}>
                    <ThemedText style={styles.abilityName}>
                      {formatName(pokemonAbility.ability.name)}
                    </ThemedText>
                    <View style={styles.slotBadge}>
                      <ThemedText style={styles.slotText}>Slot {pokemonAbility.slot}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.abilityDescription}>
                    {abilityDescriptions[pokemonAbility.ability.name] ||
                     'Ability description not available. This ability may have unique effects in battle.'}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {hiddenAbilities.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Hidden Abilities</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              These abilities are rare and can only be obtained through special encounters, events, or breeding.
            </ThemedText>
            <View style={styles.abilitiesContainer}>
              {hiddenAbilities.map((pokemonAbility) => (
                <View
                  key={pokemonAbility.ability.id}
                  style={[styles.abilityCard, { borderColor, backgroundColor: hiddenCardBgColor }]}
                >
                  <View style={styles.abilityHeader}>
                    <ThemedText style={styles.abilityName}>
                      {formatName(pokemonAbility.ability.name)}
                    </ThemedText>
                    <View style={[styles.slotBadge, styles.hiddenBadge]}>
                      <ThemedText style={styles.hiddenSlotText}>Hidden</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.abilityDescription}>
                    {abilityDescriptions[pokemonAbility.ability.name] ||
                     'Ability description not available. This hidden ability may provide unique strategic advantages.'}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>About Abilities</ThemedText>
          <View style={[styles.infoCard, { borderColor }]}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoTitle}>Normal Abilities</ThemedText>
              <ThemedText style={styles.infoText}>
                Pokemon typically have 1-2 normal abilities. When encountered in the wild or hatched from eggs,
                they will randomly have one of these abilities.
              </ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoTitle}>Hidden Abilities</ThemedText>
              <ThemedText style={styles.infoText}>
                Hidden abilities are special abilities that are much rarer. They can be obtained through:
                {'\n'}• Special events or distributions
                {'\n'}• Breeding with Pokemon that have hidden abilities
                {'\n'}• Certain special encounters in games
              </ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoTitle}>Ability Slots</ThemedText>
              <ThemedText style={styles.infoText}>
                The slot number indicates which of the Pokemon's possible abilities this is.
                Slot 1 is the primary ability, slot 2 is the secondary (if available), and hidden abilities are separate.
              </ThemedText>
            </View>
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  abilitiesContainer: {
    gap: 12,
  },
  abilityCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  abilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  slotBadge: {
    backgroundColor: '#BBDEFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hiddenBadge: {
    backgroundColor: '#FF9800',
  },
  slotText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0D47A1',
  },
  hiddenSlotText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  abilityDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
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