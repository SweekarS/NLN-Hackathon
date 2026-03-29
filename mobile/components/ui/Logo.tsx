import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadow } from '../../theme';

export function Logo({ size = 100 }: { size?: number }) {
  const iconSize = size * 0.45;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <LinearGradient
        colors={[colors.primaryLight, colors.surface]}
        style={[styles.gradient, { borderRadius: size / 2 }]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <LinearGradient
          colors={[colors.white, colors.surfaceLow]}
          style={[
            styles.innerCircle,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name="leaf-outline"
            size={iconSize}
            color={colors.primary}
          />
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...shadow.card,
    elevation: 4,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.card,
    shadowOpacity: 0.08,
    elevation: 2,
  },
});
