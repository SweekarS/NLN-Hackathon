import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, spacing } from '../../theme';

interface SelectorPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function SelectorPill({
  label,
  selected,
  onPress,
  iconName,
}: SelectorPillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillActive]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={16}
          color={selected ? colors.white : colors.onSurfaceVariant}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, selected && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.chip,
    backgroundColor: colors.surfaceLow,
    minHeight: 44,
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  icon: {
    marginRight: 6,
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
