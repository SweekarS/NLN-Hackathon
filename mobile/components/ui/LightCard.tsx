import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, spacing } from '../../theme';

interface LightCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function LightCard({ children, style }: LightCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryLighter,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
});
