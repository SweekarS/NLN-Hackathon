import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

import { colors, fonts, spacing, radii, botanicalGradient } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { GreenCard } from '../../components/ui/GreenCard';
import { LightCard } from '../../components/ui/LightCard';
import { Button } from '../../components/ui/Button';
import { TaskCard } from '../../components/ui/TaskCard';

export default function TasksScreen() {
  const { tasks, todayCompletions, completeTask } = useAppStore();

  const completionPct =
    tasks.length > 0 ? (todayCompletions.length / tasks.length) * 100 : 0;

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
            <LinearGradient
              colors={[...botanicalGradient.colors]}
              start={botanicalGradient.start}
              end={botanicalGradient.end}
              style={styles.avatar}
            >
              <Ionicons name="person" size={20} color={colors.white} />
            </LinearGradient>
            <Text style={styles.appTitle}>The Organic Sanctuary</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={colors.onSurface} />
          </Pressable>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.headerRow}>
          <Text style={styles.pageTitle}>Daily Rituals</Text>
          <Button
            title="Customize"
            onPress={() => router.push('/customize')}
            variant="light"
            style={styles.customizeBtn}
          />
        </Animated.View>
        <Text style={styles.subtitle}>
          {tasks.length} steps toward clarity today
        </Text>

        {/* Progress Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <GreenCard style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                TODAY'S PROGRESS {Math.round(completionPct)}%
              </Text>
              <Button
                title="Complete all"
                onPress={() => tasks.forEach((t) => completeTask(t.id))}
                variant="light"
                style={styles.completeAllBtn}
              />
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(completionPct, 100)}%` },
                ]}
              />
            </View>
          </GreenCard>
        </Animated.View>

        {/* Task List */}
        <View style={styles.taskList}>
          {tasks.map((task, idx) => (
            <Animated.View
              key={task.id}
              entering={FadeInUp.delay(300 + idx * 80).duration(500)}
            >
              <TaskCard
                icon={task.icon}
                title={task.title}
                subtitle={task.subtitle}
                duration={task.duration}
                isDone={todayCompletions.includes(task.id)}
                onComplete={() => completeTask(task.id)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Rest Nudge */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <LightCard style={styles.restCard}>
            <Text style={styles.restEmoji}>🌙</Text>
            <Text style={styles.restTitle}>Approaching a Rest Cycle?</Text>
            <Text style={styles.restSubtitle}>
              Listen to your body — rest is part of growth.
            </Text>
            <Button
              title="Enable Rest Mode"
              onPress={() => {}}
              variant="ghost"
              style={styles.restBtn}
            />
          </LightCard>
        </Animated.View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
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
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    color: colors.white,
  },
  completeAllBtn: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
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
    gap: spacing.sm,
  },
  restEmoji: {
    fontSize: 32,
  },
  restTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  restSubtitle: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  restBtn: {
    marginTop: spacing.xs,
  },
});
