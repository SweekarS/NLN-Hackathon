import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, type AVPlaybackStatus } from 'expo-av';

// Bundled MP3 (Metro resolves .mp3 by default). Forest ambience loop — OpenGameArt / CC-BY style asset.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SOUNDSCAPE = require('../assets/sounds/nature-ambient.mp3');

export function useForestSoundscape() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(SOUNDSCAPE, {
          isLooping: true,
          volume: 0.5,
          shouldPlay: false,
        });

        if (cancelled) {
          await sound.unloadAsync();
          return;
        }

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setPlaying(status.isPlaying);
        });

        soundRef.current = sound;
        setReady(true);
      } catch (e) {
        if (__DEV__) console.warn('[Soundscape] load failed', e);
      }
    })();

    return () => {
      cancelled = true;
      const s = soundRef.current;
      soundRef.current = null;
      setReady(false);
      setPlaying(false);
      if (s) {
        s.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const toggle = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (e) {
      if (__DEV__) console.warn('[Soundscape] toggle', e);
    }
  }, []);

  return { playing, ready, toggle };
}
