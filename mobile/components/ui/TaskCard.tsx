import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, shadow, spacing } from '../../theme';

interface TaskCardProps {
  icon: string;
  title: string;
  subtitle: string;
  duration?: string;
  isDone: boolean;
  onComplete: () => void;
}

export function TaskCard({ icon, title, subtitle, duration, isDone, onComplete }: TaskCardProps) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDone ? 0.65 : 1, { duration: 300 }),
    transform: [{ scale: withTiming(isDone ? 0.98 : 1, { duration: 300 }) }],
  }));

  const handlePress = () => {
    if (!isDone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onComplete();
    }
  };

  return (
    <Animated.View style={[styles.card, animStyle]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {duration && <Text style={styles.duration}>{duration}</Text>}
        <Pressable
          onPress={handlePress}
          style={[styles.btn, isDone && styles.btnDone]}
          accessibilityRole="button"
          accessibilityLabel={isDone ? 'Completed' : 'Mark complete'}
        >
          <Ionicons
            name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
            size={28}
            color={isDone ? colors.white : colors.primary}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadow.card,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  right: {
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: colors.outline,
  },
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  btnDone: {
    backgroundColor: colors.primary,
  },
});
