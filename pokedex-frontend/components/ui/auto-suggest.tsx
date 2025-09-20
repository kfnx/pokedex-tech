import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface PokemonSuggestion {
  id: number;
  name: string;
  spriteFrontDefault: string;
}

interface AutoSuggestProps {
  suggestions: PokemonSuggestion[];
  loading: boolean;
  onSuggestionPress: (suggestion: PokemonSuggestion) => void;
  visible: boolean;
}

export function AutoSuggest({ suggestions, loading, onSuggestionPress, visible }: AutoSuggestProps) {
  if (!visible || (suggestions.length === 0 && !loading)) {
    return null;
  }

  const backgroundColor = '#1a1a1a';
  const borderColor = '#333333';
  const textColor = '#FFFFFF';

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={textColor} />
          <ThemedText style={styles.loadingText}>Loading suggestions...</ThemedText>
        </View>
      )}

      {suggestions.map((suggestion, index) => (
        <Pressable
          key={`${suggestion.id}-${index}`}
          style={({ pressed }) => [
            styles.suggestionItem,
            { backgroundColor: pressed ? '#333333' : 'transparent' }
          ]}
          onPress={() => onSuggestionPress(suggestion)}
        >
          <Image
            source={{ uri: suggestion.spriteFrontDefault }}
            style={styles.sprite}
            contentFit="contain"
          />
          <ThemedText style={[styles.suggestionText, { color: textColor }]}>
            {suggestion.name}
          </ThemedText>
        </Pressable>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  sprite: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    textTransform: 'capitalize',
    flex: 1,
  },
});