import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme';

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
}

const TRACK_W = 52;
const TRACK_H = 30;
const THUMB = 24;
const PADDING = 3;

export function Toggle({ value, onToggle }: ToggleProps) {
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(value ? TRACK_W - THUMB - PADDING * 2 : 0, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.track,
        { backgroundColor: value ? colors.primary : colors.surfaceMid },
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
