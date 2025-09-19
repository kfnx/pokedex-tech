import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function PokemonSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const backgroundColor = useThemeColor({}, 'background');
  const skeletonColor = useThemeColor({ light: '#e0e0e0', dark: '#444' }, 'background');

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.imageContainer,
          { backgroundColor: skeletonColor, opacity: fadeAnim },
        ]}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.textLine,
            styles.idLine,
            { backgroundColor: skeletonColor, opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.textLine,
            styles.nameLine,
            { backgroundColor: skeletonColor, opacity: fadeAnim },
          ]}
        />
        <View style={styles.typesContainer}>
          <Animated.View
            style={[
              styles.typeTag,
              { backgroundColor: skeletonColor, opacity: fadeAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.typeTag,
              { backgroundColor: skeletonColor, opacity: fadeAnim },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 100,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  textLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  idLine: {
    width: 40,
    height: 10,
  },
  nameLine: {
    width: 120,
    height: 16,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  typeTag: {
    width: 60,
    height: 20,
    borderRadius: 4,
  },
});