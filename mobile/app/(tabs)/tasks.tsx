import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
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
import { IconCircle } from '../../components/ui/IconCircle';

export default function TasksScreen() {
  const { tasks, todayCompletions, completeTask, avatarImage, unreadCount } =
    useAppStore();

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
            {avatarImage ? (
              <Image
                source={{ uri: avatarImage }}
                style={[styles.avatar, { resizeMode: 'cover' }]}
              />
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

        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          style={styles.headerRow}
        >
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
                iconName={task.icon as any}
                title={task.title}
                subtitle={task.subtitle}
                duration={task.duration}
                isDone={todayCompletions.includes(task.id)}
                onComplete={() => completeTask(task.id)}
              />
            </Animated.View>
          ))}
        </View>

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
    fontFamily: fonts.bodyBold || fonts.headlineBold,
  },
});
