import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

type IconCircleSize = 'sm' | 'md' | 'lg';

interface IconCircleProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: IconCircleSize;
  color?: string;
  bg?: string;
}

const dims: Record<IconCircleSize, { box: number; icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: 40, icon: 20 },
  lg: { box: 56, icon: 28 },
};

export function IconCircle({
  name,
  size = 'md',
  color = colors.primary,
  bg = colors.primaryLighter,
}: IconCircleProps) {
  const d = dims[size];
  return (
    <View style={[styles.circle, { width: d.box, height: d.box, borderRadius: d.box / 2, backgroundColor: bg }]}>
      <Ionicons name={name} size={d.icon} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
