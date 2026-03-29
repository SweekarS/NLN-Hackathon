import React, { useEffect, useMemo, useRef } from 'react';
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
import { normalizeTask } from '../../lib/task-model';
import { colors, fonts, radii, shadow, spacing } from '../../theme';

interface TaskCardProps {
  task: Task;
  isDone: boolean;
  /** Position in the enabled ritual list (0–3 used to infer type for legacy tasks). */
  listIndex?: number;
  /** Opens interaction flow (timer / photo / simple). */
  onOpen: () => void;
}

export function TaskCard({ task, isDone, listIndex, onOpen }: TaskCardProps) {
  const nt = useMemo(() => normalizeTask(task, listIndex), [task, listIndex]);
  const mode = nt.interaction_type ?? 'simple_check';
  const iconName = resolveTaskIonicon(nt);
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
    nt.duration ||
    (mode === 'timer' && nt.duration_minutes ? `${nt.duration_minutes} min` : undefined);

  const typeHint =
    mode === 'timer'
      ? { icon: 'timer-outline' as const, label: 'Timer', tone: 'timer' as const }
      : mode === 'photo_upload'
        ? { icon: 'camera-outline' as const, label: 'Photo check-in', tone: 'photo' as const }
        : { icon: 'checkmark-done-outline' as const, label: 'Quick check', tone: 'check' as const };

  const actionIcon =
    isDone ? 'checkmark-circle' : mode === 'timer' ? 'timer-outline' : mode === 'photo_upload' ? 'camera-outline' : 'chevron-forward';

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
            <View style={styles.titleRow}>
              <Text style={styles.title}>{nt.title}</Text>
              <View
                style={[
                  styles.typeChip,
                  typeHint.tone === 'timer' && styles.typeChipTimer,
                  typeHint.tone === 'photo' && styles.typeChipPhoto,
                  typeHint.tone === 'check' && styles.typeChipCheck,
                ]}
              >
                <Ionicons name={typeHint.icon} size={11} color={colors.primary} />
                <Text style={styles.typeChipText}>{typeHint.label}</Text>
              </View>
            </View>
            <Text style={styles.subtitle} numberOfLines={2}>
              {nt.subtitle}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          {mode === 'timer' && durationLabel ? (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color={colors.outline} />
              <Text style={styles.duration}>{durationLabel}</Text>
            </View>
          ) : mode === 'photo_upload' ? (
            <View style={styles.durationBadge}>
              <Ionicons name="images-outline" size={12} color={colors.outline} />
              <Text style={styles.duration}>Add photo</Text>
            </View>
          ) : (
            <View style={styles.durationBadge}>
              <Ionicons name="hand-left-outline" size={12} color={colors.outline} />
              <Text style={styles.duration}>Tap when done</Text>
            </View>
          )}
          <Animated.View
            style={[styles.actionHint, isDone && styles.actionDone, checkStyle]}
          >
            <Ionicons
              name={actionIcon as keyof typeof Ionicons.glyphMap}
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
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    flexShrink: 1,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.surfaceLow,
  },
  typeChipTimer: {
    backgroundColor: '#E8F5EE',
  },
  typeChipPhoto: {
    backgroundColor: '#E3F2FD',
  },
  typeChipCheck: {
    backgroundColor: colors.primaryLighter,
  },
  typeChipText: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    letterSpacing: 0.2,
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
