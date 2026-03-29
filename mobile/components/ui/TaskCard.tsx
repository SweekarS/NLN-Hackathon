import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { Task } from '../../types/task';
import { IconCircle } from './IconCircle';
import { resolveTaskIonicon } from '../../lib/task-icons';
import { colors, fonts, radii, shadow, spacing } from '../../theme';

interface TaskCardProps {
  task: Task;
  isDone: boolean;
  /** Opens interaction flow (timer / photo / simple). */
  onOpen: () => void;
}

export function TaskCard({ task, isDone, onOpen }: TaskCardProps) {
  const iconName = resolveTaskIonicon(task);
  const doneProgress = useSharedValue(isDone ? 1 : 0);
  const checkPop = useSharedValue(1);
  const wasDone = useRef(isDone);

  useEffect(() => {
    doneProgress.value = withSpring(isDone ? 1 : 0, {
      damping: 17,
      stiffness: 200,
      mass: 0.55,
    });
    if (isDone && !wasDone.current) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      checkPop.value = withSequence(
        withSpring(1.18, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 14, stiffness: 320 }),
      );
    }
    wasDone.current = isDone;
  }, [isDone, doneProgress, checkPop]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      doneProgress.value,
      [0, 1],
      [1, 0.72],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          doneProgress.value,
          [0, 1],
          [1, 0.985],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkPop.value }],
  }));

  const handlePress = () => {
    if (isDone) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpen();
  };

  const durationLabel =
    task.duration ||
    (task.interaction_type === 'timer' && task.duration_minutes
      ? `${task.duration_minutes}M`
      : undefined);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDone}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.left}>
          <IconCircle name={iconName} size="md" />
          <View style={styles.textBlock}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {task.subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          {durationLabel ? (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color={colors.outline} />
              <Text style={styles.duration}>{durationLabel}</Text>
            </View>
          ) : null}
          <Animated.View
            style={[styles.actionHint, isDone && styles.actionDone, checkStyle]}
          >
            <Ionicons
              name={isDone ? 'checkmark-circle' : 'chevron-forward'}
              size={26}
              color={isDone ? colors.white : colors.primary}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
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
  textBlock: {
    flex: 1,
    paddingRight: spacing.sm,
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
    alignItems: 'flex-end',
    gap: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceLow,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  duration: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: colors.outline,
  },
  actionHint: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  actionDone: {
    backgroundColor: colors.primary,
  },
});
