import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { botanicalGradient, radii, spacing, shadow } from '../../theme';

interface GreenCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GreenCard({ children, style }: GreenCardProps) {
  return (
    <LinearGradient
      colors={[...botanicalGradient.colors]}
      start={botanicalGradient.start}
      end={botanicalGradient.end}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.lg,
    ...shadow.card,
  },
});
