import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import {
  colors,
  fonts,
  spacing,
  radii,
  shadow,
  botanicalGradient,
} from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { Task } from '../../types/task';
import { Button } from '../../components/ui/Button';
import { TaskCard } from '../../components/ui/TaskCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { TaskInteractionModal } from '../../components/tasks/TaskInteractionModal';

export default function TasksScreen() {
  const { tasks, todayCompletions, completeTask, unreadCount } =
    useAppStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTaskListIndex, setActiveTaskListIndex] = useState<number | undefined>(
    undefined,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const enabledTasks = useMemo(() => tasks.filter((t) => t.enabled), [tasks]);
  const completionPct =
    enabledTasks.length > 0
      ? (todayCompletions.filter((id) => enabledTasks.some((t) => t.id === id))
          .length /
          enabledTasks.length) *
        100
      : 0;

  const pctAnim = useSharedValue(completionPct);
  useEffect(() => {
    pctAnim.value = withSpring(completionPct, { damping: 18, stiffness: 140 });
  }, [completionPct, pctAnim]);

  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        260,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
  }, [completionPct]);

  const barAnimStyle = useAnimatedStyle(() => ({
    width: `${Math.min(pctAnim.value, 100)}%`,
  }));

  const openTask = useCallback((task: Task, listIndex: number) => {
    setActiveTask(task);
    setActiveTaskListIndex(listIndex);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setActiveTask(null);
    setActiveTaskListIndex(undefined);
  }, []);

  const handleCompleteFromModal = useCallback(
    (taskId: string) => {
      completeTask(taskId);
    },
    [completeTask],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TopBar */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={styles.topTitle}>Tasks</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
            <View style={{ position: 'relative' }}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.onSurface}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>

        {/* Title row */}
        <Animated.View
          entering={FadeInUp.delay(80).duration(500)}
          style={styles.headerRow}
        >
          <Text style={styles.pageTitle}>Daily Conditioning</Text>
          <Button
            title="Customize"
            onPress={() => router.push('/customize')}
            variant="light"
            style={styles.customizeBtn}
          />
        </Animated.View>
        <Text style={styles.subtitle}>
          {enabledTasks.length} steps toward clarity today
        </Text>

        {/* Progress + ring */}
        <Animated.View entering={FadeInUp.delay(160).duration(500)}>
          <LinearGradient
            colors={['#0B5C3F', '#0A7A52', '#2E9B6E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressHero}
          >
            <Text style={styles.progressLabel}>TODAY&apos;S PROGRESS</Text>
            <View style={styles.ringRow}>
              <ProgressRing
                progress={completionPct / 100}
                size={140}
                strokeWidth={12}
                color={colors.primaryLight}
                bgColor="rgba(255,255,255,0.22)"
              >
                <Text style={styles.pctBig}>{Math.round(completionPct)}%</Text>
              </ProgressRing>
            </View>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFill, barAnimStyle]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Task list */}
        <View style={styles.taskList}>
          {enabledTasks.map((task, idx) => (
            <Animated.View
              key={task.id}
              layout={LinearTransition.springify().damping(18).stiffness(160)}
              entering={FadeInUp.delay(220 + idx * 70).duration(450)}
            >
              <TaskCard
                task={task}
                listIndex={idx}
                isDone={todayCompletions.includes(task.id)}
                onOpen={() => openTask(task, idx)}
              />
            </Animated.View>
          ))}
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <TaskInteractionModal
        visible={modalVisible}
        task={activeTask}
        taskListIndex={activeTaskListIndex}
        onClose={closeModal}
        onComplete={handleCompleteFromModal}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: fonts.bodyBold,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
  },
  customizeBtn: {
    height: 40,
    paddingHorizontal: spacing.base,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  progressHero: {
    borderRadius: radii.card,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  ringRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  pctBig: {
    fontSize: 28,
    fontFamily: fonts.headlineExtraBold,
    color: colors.white,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
  },
  taskList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
