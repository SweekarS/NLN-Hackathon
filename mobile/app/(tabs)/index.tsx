import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';

import {
  colors,
  fonts,
  spacing,
  radii,
  shadow,
  botanicalGradient,
} from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  buildMindfulnessFlow30Day,
  flagsFromTaskIds,
  formatWeeklyAverageLabel,
  getLogicalDateString,
} from '../../lib/dashboard-stats';
import { Card } from '../../components/ui/Card';
import { GreenCard } from '../../components/ui/GreenCard';
import { LightCard } from '../../components/ui/LightCard';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { IconCircle } from '../../components/ui/IconCircle';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Heatmap } from '../../components/ui/Heatmap';
import { BottomSheet } from '../../components/ui/BottomSheet';

export default function HomeScreen() {
  const {
    currentStreak,
    level,
    totalXP,
    tasks,
    todayCompletions,
    weeklyActiveDaysCount,
    levelTitle,
    syncUserStats,
    dailyLogsByDate,
    lastLogicalDateKey,
    unreadCount,
  } = useAppStore();
  const [achievementVisible, setAchievementVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      syncUserStats();
    }, [syncUserStats]),
  );

  const anchorDate = lastLogicalDateKey ?? getLogicalDateString();
  const todayFlags = flagsFromTaskIds(todayCompletions, tasks);
  const mindfulnessFlow30 = useMemo(
    () => buildMindfulnessFlow30Day(dailyLogsByDate, anchorDate, todayFlags),
    [dailyLogsByDate, anchorDate, todayCompletions, tasks],
  );

  const progress =
    tasks.length > 0 ? todayCompletions.length / tasks.length : 0;

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
            <Text style={styles.topTitle}>Home</Text>
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

        {/* Hero Affirmation */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <LightCard style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>
                  Grow at your own pace today.
                </Text>
                <Text style={styles.heroSubtitle}>
                  Every small step nurtures your growth on Phool.
                </Text>
              </View>
              <LinearGradient
                colors={[...botanicalGradient.colors]}
                start={botanicalGradient.start}
                end={botanicalGradient.end}
                style={styles.heroCircle}
              >
                <Ionicons name="leaf" size={40} color={colors.white} />
              </LinearGradient>
            </View>
          </LightCard>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              iconName="flame-outline"
              value={String(currentStreak)}
              label="CURRENT STREAK"
              delay={0}
              hint={currentStreak === 0 ? 'Take your time' : undefined}
            />
            <StatCard
              iconName="checkmark-circle-outline"
              value={formatWeeklyAverageLabel(weeklyActiveDaysCount)}
              label="WEEKLY AVG"
              delay={100}
            />
          </View>
          <View style={styles.statsRow}>
            <Pressable onPress={() => router.push('/ranks')} style={{ flex: 1 }}>
              <StatCard
                iconName="sparkles-outline"
                value={levelTitle}
                label="GROWTH TIER"
                delay={200}
                hint={`Level ${level}`}
              />
            </Pressable>
            <StatCard
              iconName="trending-up-outline"
              value={String(totalXP)}
              label="TOTAL XP"
              delay={300}
            />
          </View>
        </View>

        {/* Mindfulness Flow */}
        <SectionTitle title="Mindfulness Flow" />
        <Animated.View entering={FadeInUp.delay(350).duration(500)}>
          <Card>
            <Heatmap intensities={mindfulnessFlow30} />
            <Text style={styles.heatmapQuote}>
              Your consistency is the foundation of your inner peace.
            </Text>
          </Card>
        </Animated.View>

        {/* Today's Balance */}
        <Animated.View entering={FadeInUp.delay(450).duration(500)}>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <GreenCard style={styles.balanceCard}>
              <View style={styles.balanceRow}>
                <ProgressRing progress={progress} size={80}>
                  <Text style={styles.ringText}>
                    {todayCompletions.length}/{tasks.length}
                  </Text>
                </ProgressRing>
                <View style={styles.balanceTextBlock}>
                  <Text style={styles.balanceTitle}>Today's Balance</Text>
                  <Text style={styles.balanceSubtitle}>
                    {todayCompletions.length} of {tasks.length} Conditioning complete
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.white}
                />
              </View>
            </GreenCard>
          </Pressable>
        </Animated.View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Achievement BottomSheet */}
      <BottomSheet
        visible={achievementVisible}
        onClose={() => setAchievementVisible(false)}
        title="Achievement Unlocked"
      >
        <View style={styles.sheetContent}>
          <LinearGradient
            colors={[...botanicalGradient.colors]}
            start={botanicalGradient.start}
            end={botanicalGradient.end}
            style={styles.sheetBadge}
          >
            <Ionicons name="leaf-outline" size={36} color={colors.white} />
          </LinearGradient>
          <Text style={styles.sheetName}>Mist Wanderer</Text>
          <Text style={styles.sheetDesc}>
            Awarded for 7 consecutive days of mindful practice.
          </Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '70%' }]} />
          </View>
          <Text style={styles.progressLabel}>70% to next milestone</Text>
          <Button
            title="Share Achievement"
            onPress={() => setAchievementVisible(false)}
            variant="primary"
            style={{ marginTop: spacing.base }}
          />
        </View>
      </BottomSheet>
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
  heroCard: {
    marginBottom: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  heroCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heatmapQuote: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    fontStyle: 'italic',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  balanceCard: {
    marginTop: spacing.base,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  ringText: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.white,
  },
  balanceTextBlock: {
    flex: 1,
  },
  balanceTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.white,
  },
  balanceSubtitle: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.primaryLight,
    marginTop: 2,
  },

  sheetContent: {
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  sheetBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  sheetName: {
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sheetDesc: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceLow,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.outline,
    marginTop: spacing.xs,
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
