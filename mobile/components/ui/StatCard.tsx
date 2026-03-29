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
}

export function StatCard({ iconName, value, label, delay = 0 }: StatCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500).springify()} style={styles.card}>
      <IconCircle name={iconName} size="sm" />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
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
});
