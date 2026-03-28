import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii, spacing } from '../../theme';

interface SelectorPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectorPill({ label, selected, onPress }: SelectorPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillActive]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.text, selected && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.chip,
    backgroundColor: colors.surfaceLow,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  textActive: {
    color: colors.white,
  },
});
