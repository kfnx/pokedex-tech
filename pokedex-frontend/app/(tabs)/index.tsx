import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  View,
  TextInput,
  RefreshControl,
  Text,
  useWindowDimensions
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PokemonCard } from '@/components/pokemon/pokemon-card';
import { PokemonSkeleton } from '@/components/pokemon/pokemon-skeleton';
import { useInfinitePokemonList } from '@/hooks/use-pokemon';
import { Pokemon } from '@/services/api';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();

  const backgroundColor = '#000000';
  const textColor = '#FFFFFF';
  
  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    if (width >= 1024) return 3; // Large desktop
    if (width >= 768) return 2; // Tablet
    return 1; // Mobile
  }, [width]);

  const {
    pokemon,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
  } = useInfinitePokemonList({
    limit: 20,
  });

  const handlePokemonPress = useCallback((pokemon: Pokemon) => {
    router.push(`/pokemon/${pokemon.id}`);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderItem = useCallback(({ item }: { item: Pokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => handlePokemonPress(item)}
    />
  ), [handlePokemonPress]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={textColor} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          {searchQuery ? 'No Pokemon found' : 'No Pokemon available'}
        </ThemedText>
      </ThemedView>
    );
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/pokedex.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        </View>
        <FlatList
          data={Array.from({ length: 10 })}
          renderItem={() => <PokemonSkeleton />}
          keyExtractor={(_, index) => index.toString()}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.listContent}
        />
      </ThemedView>
    );
  }

  if (error && !pokemon.length) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/pokedex.png')}
          style={styles.headerLogo}
          contentFit="contain"
        />
      </View>

      <FlatList
        data={pokemon}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        key={numColumns} // Force re-render when columns change
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[textColor]}
            tintColor={textColor}
          />
        }
      />
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
  header: {
    padding: 16,
  },
  headerLogo: {
    height: 60,
    width: '100%',
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 8,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
