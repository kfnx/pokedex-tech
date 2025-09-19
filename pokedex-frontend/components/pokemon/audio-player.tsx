import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

interface AudioPlayerProps {
  audioUrl: string;
  label?: string;
}

export function AudioPlayer({ audioUrl, label }: AudioPlayerProps) {
  const player = useAudioPlayer(audioUrl);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    player.volume = 0.2;
  }, [player]);

  const playPauseAudio = async () => {
    try {
      setIsLoading(true);
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, styles.playButton]}
          onPress={playPauseAudio}
          disabled={isLoading}
        >
          <IconSymbol
            size={16}
            name={isLoading ? 'clock' : player.playing ? 'pause' : 'play'}
            color="#fff"
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginVertical: 4,
  },
  controls: {
    alignItems: 'center',
    marginRight: 12,
  },
  button: {
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#0A84FF',
    width: 36,
    height: 36,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});