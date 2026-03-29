import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { IconCircle } from './IconCircle';
import { colors, fonts, radii, shadow, spacing } from '../../theme';

interface StatCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  delay?: number;
  /** Small line under the label (e.g. gentle streak copy). */
  hint?: string;
}

export function StatCard({
  iconName,
  value,
  label,
  delay = 0,
  hint,
}: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(500).springify()}
      style={styles.card}
    >
      <IconCircle name={iconName} size="sm" />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.base,
    alignItems: 'center',
    gap: 4,
    ...shadow.card,
  },
  value: {
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hint: {
    fontSize: 10,
    fontFamily: fonts.bodyRegular,
    color: colors.outline,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
});
