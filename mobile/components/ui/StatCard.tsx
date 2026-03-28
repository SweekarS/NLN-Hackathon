import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, fonts, radii, shadow, spacing } from '../../theme';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  delay?: number;
}

export function StatCard({ icon, value, label, delay = 0 }: StatCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500).springify()} style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
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
  icon: {
    fontSize: 22,
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
