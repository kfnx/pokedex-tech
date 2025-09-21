import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface ErrorViewProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorView({ error, onRetry, title = 'Something went wrong' }: ErrorViewProps) {
  const backgroundColor = '#000000';
  const borderColor = '#333333';

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.errorText}>{error}</ThemedText>
      {onRetry && (
        <Pressable
          style={[styles.retryButton, { borderColor }]}
          onPress={onRetry}
        >
          <ThemedText style={styles.retryText}>Try Again</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    opacity: 0.8,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});