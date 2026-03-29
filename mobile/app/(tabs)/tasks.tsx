import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

import { colors, fonts, spacing, radii, shadow, botanicalGradient } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { Task } from '../../types/task';
import { LightCard } from '../../components/ui/LightCard';
import { Button } from '../../components/ui/Button';
import { TaskCard } from '../../components/ui/TaskCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { TaskInteractionModal } from '../../components/tasks/TaskInteractionModal';

export default function TasksScreen() {
  const { tasks, todayCompletions, completeTask, avatarImage } = useAppStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const enabledTasks = useMemo(() => tasks.filter((t) => t.enabled), [tasks]);
  const completionPct =
    enabledTasks.length > 0
      ? (todayCompletions.filter((id) => enabledTasks.some((t) => t.id === id)).length /
          enabledTasks.length) *
        100
      : 0;

  const openTask = useCallback((task: Task) => {
    setActiveTask(task);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setActiveTask(null);
  }, []);

  const handleCompleteFromModal = useCallback(
    (taskId: string) => {
      completeTask(taskId);
    },
    [completeTask]
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
            {avatarImage ? (
              <Image source={{ uri: avatarImage }} style={[styles.avatar, { resizeMode: 'cover' }]} />
            ) : (
              <LinearGradient
                colors={[...botanicalGradient.colors]}
                start={botanicalGradient.start}
                end={botanicalGradient.end}
                style={styles.avatar}
              >
                <Ionicons name="person" size={20} color={colors.white} />
              </LinearGradient>
            )}
            <Text style={styles.appTitle}>The Organic Sanctuary</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={colors.onSurface} />
          </Pressable>
        </Animated.View>

        {/* Title row */}
        <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.headerRow}>
          <Text style={styles.pageTitle}>Daily Rituals</Text>
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
              <View style={[styles.barFill, { width: `${Math.min(completionPct, 100)}%` }]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Task list */}
        <View style={styles.taskList}>
          {enabledTasks.map((task, idx) => (
            <Animated.View key={task.id} entering={FadeInUp.delay(220 + idx * 70).duration(450)}>
              <TaskCard
                task={task}
                isDone={todayCompletions.includes(task.id)}
                onOpen={() => openTask(task)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Rest Cycle */}
        <Animated.View entering={FadeInUp.delay(520).duration(500)}>
          <LightCard style={styles.restCard}>
            <View style={styles.restIconWrap}>
              <LinearGradient
                colors={['#E8F5EE', '#F6FBF7']}
                style={styles.restIconBg}
              >
                <Ionicons name="moon-outline" size={28} color={colors.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.restTitle}>Rest Cycle</Text>
            <Text style={styles.restSubtitle}>
              Approaching a rest cycle? Listen to your body — rest is part of growth.
            </Text>
            <Button
              title="Enable Rest Mode"
              onPress={() => {}}
              variant="ghost"
              style={styles.restBtn}
              textStyle={styles.restBtnText}
            />
          </LightCard>
        </Animated.View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <TaskInteractionModal
        visible={modalVisible}
        task={activeTask}
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
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.primary,
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
  restCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceMid,
  },
  restIconWrap: {
    marginBottom: spacing.sm,
  },
  restIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  restSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  restBtn: {
    marginTop: spacing.xs,
  },
  restBtnText: {
    color: colors.primary,
  },
});
