import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { colors, fonts, spacing, radii } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  buildMindfulnessFlow30Day,
  buildMindfulnessFlow7Day,
  calculateHarmonyScore,
  flagsFromTaskIds,
  getLogicalDateString,
} from '../../lib/dashboard-stats';
import { GreenCard } from '../../components/ui/GreenCard';
import { LightCard } from '../../components/ui/LightCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { XPBar } from '../../components/ui/XPBar';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Heatmap } from '../../components/ui/Heatmap';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { IconCircle } from '../../components/ui/IconCircle';

function formatStreakDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown date';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleString('en-US', { month: 'long', day: 'numeric' });
  } catch {
    return 'Unknown date';
  }
}

function calculateStreakProgress(
  currentStreak: number,
  longestStreak: number,
): { progress: number; percentage: number } {
  if (longestStreak === 0) {
    return { progress: 0, percentage: 0 };
  }
  const progress = currentStreak / longestStreak;
  const percentage = Math.round(progress * 100);
  return { progress: Math.min(progress, 1), percentage };
}

export default function InsightsScreen() {
  const {
    currentStreak,
    longestStreak,
    longestStreakEndDate,
    activeDays90,
    dailyLogsByDate,
    todayCompletions,
    tasks,
    lastLogicalDateKey,
    userName,
    unreadCount,
  } = useAppStore();

  const anchorDate = lastLogicalDateKey ?? getLogicalDateString();
  const todayFlags = flagsFromTaskIds(todayCompletions, tasks);
  const mindfulnessFlow30 = useMemo(
    () => buildMindfulnessFlow30Day(dailyLogsByDate, anchorDate, todayFlags),
    [dailyLogsByDate, anchorDate, todayCompletions, tasks],
  );

  const mindfulnessFlow7 = useMemo(
    () => buildMindfulnessFlow7Day(dailyLogsByDate, anchorDate, todayFlags),
    [dailyLogsByDate, anchorDate, todayCompletions, tasks],
  );

  const harmonyScore = useMemo(
    () => calculateHarmonyScore(dailyLogsByDate, anchorDate),
    [dailyLogsByDate, anchorDate],
  );

  const { progress: streakProgress, percentage: streakPercentage } = useMemo(
    () => calculateStreakProgress(currentStreak, longestStreak),
    [currentStreak, longestStreak],
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
            <Text style={styles.topTitle}>Insights</Text>
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

        {/* Streak Hero */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <GreenCard>
            <Text style={styles.heroLabel}>CURRENT MOMENTUM</Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroBig}>{currentStreak}</Text>
              <Text style={styles.heroDays}>Days</Text>
            </View>
            <Text style={styles.heroSubtitle}>
              Your spirit grows stronger with each mindful day.
            </Text>
            <Button
              title="Log Today's Reflection"
              onPress={() => router.push('/journal')}
              variant="light"
              style={{ marginTop: spacing.base }}
            />
          </GreenCard>
        </Animated.View>

        {/* Personal Best */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Card style={styles.cardGap}>
            <View style={styles.centered}>
              <IconCircle name="location-outline" size="lg" />
              <Text style={styles.bestNumber}>{longestStreak}</Text>
              <Text style={styles.bestLabel}>Personal Best</Text>
              <Text style={styles.bestSub}>
                Achieved on {formatStreakDate(longestStreakEndDate)}
              </Text>
              <View style={styles.xpBarWrap}>
                <XPBar
                  progress={streakProgress}
                  height={6}
                  color={colors.primaryLight}
                />
              </View>
              <Text style={styles.bestProgress}>
                {streakPercentage}% toward a new record
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Consistency Metrics */}
        <SectionTitle title="Consistency Metrics" />

        <Card style={styles.cardGap}>
          <Text style={styles.metricLabel}>Last 7 Days</Text>
          <Heatmap intensities={mindfulnessFlow7} days={7} />

          <View style={styles.divider} />

          <Text style={styles.metricLabel}>Last 90 Days</Text>
          <View style={styles.ninetyRow}>
            <ProgressRing
              progress={activeDays90 / 90}
              size={60}
              strokeWidth={7}
            >
              <Text style={styles.ringPercent}>
                {Math.round((activeDays90 / 90) * 100)}%
              </Text>
            </ProgressRing>
            <View style={styles.ninetyText}>
              <Text style={styles.ninetyBig}>
                {Math.round((activeDays90 / 90) * 100)}%
              </Text>
              <Text style={styles.ninetySub}>
                Active: {activeDays90} days · Rest: {90 - activeDays90} days
              </Text>
            </View>
          </View>
        </Card>

        {/* Journey Insights */}
        <Animated.View entering={FadeIn.delay(300).duration(500)}>
          <Card style={styles.cardGap}>
            <View style={styles.insightRow}>
              <IconCircle name="leaf-outline" size="md" />
              <Text style={styles.insightText}>
                Your evening wind-down consistency has improved 23% this month.
                Keep nurturing this habit.
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Monthly Summary */}
        <SectionTitle title="Monthly Summary" />
        <Animated.View entering={FadeIn.delay(400).duration(500)}>
          <GreenCard>
            <Text style={styles.monthlySalutation}>
              Hello, {userName || 'friend'}
            </Text>
            <Text style={styles.monthlyBody}>
              Your March journey shows beautiful consistency. Keep nurturing
              your growth.
            </Text>
            <View style={styles.harmonyRow}>
              <ProgressRing progress={harmonyScore} size={64} strokeWidth={7}>
                <Text style={styles.harmonyPercent}>
                  {Math.round(harmonyScore * 100)}%
                </Text>
              </ProgressRing>
              <View style={{ flex: 1, marginLeft: spacing.base }}>
                <Text style={styles.harmonyLabel}>Harmony Score</Text>
                <Text style={styles.harmonySub}>
                  Based on consistency, variety, and rest balance
                </Text>
              </View>
            </View>
          </GreenCard>
        </Animated.View>

        {/* Weekly Journals */}
        <SectionTitle title="Weekly Journals" />
        <Card style={styles.cardGap}>
          <Text style={styles.journalRange}>Mar 18 — Mar 24</Text>
          <Text style={styles.journalBody}>
            A week of steady morning rituals and evening reflections. Your
            breathwork sessions deepened.
          </Text>
        </Card>
        <Card style={styles.cardGap}>
          <Text style={styles.journalRange}>Mar 11 — Mar 17</Text>
          <Text style={styles.journalBody}>
            You explored forest bathing for the first time. Three days of
            unbroken streaks.
          </Text>
        </Card>

        {/* Biometric Trends */}
        <SectionTitle title="Biometric Trends" />
        <Card style={styles.cardGap}>
          {[
            {
              icon: 'bed-outline' as const,
              label: 'Sleep Quality',
              value: '7.8 hrs avg',
            },
            {
              icon: 'footsteps-outline' as const,
              label: 'Daily Steps',
              value: '6,420 avg',
            },
            {
              icon: 'people-outline' as const,
              label: 'Social Battery',
              value: '72%',
            },
            {
              icon: 'flower-outline' as const,
              label: 'Mindfulness',
              value: '18 min avg',
            },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[styles.bioRow, i < arr.length - 1 && styles.bioRowBorder]}
            >
              <IconCircle name={item.icon} size="sm" />
              <Text style={styles.bioLabel}>{item.label}</Text>
              <Text style={styles.bioValue}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Nurture Your Next Week */}
        <SectionTitle title="Nurture Your Next Week" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.nurtureScroll}
        >
          {[
            {
              title: 'Try a digital sunset',
              sub: 'No screens 1 hour before bed',
            },
            {
              title: 'Morning gratitude',
              sub: 'Write 3 things you appreciate',
            },
            { title: 'Walk in nature', sub: '20 minutes of forest bathing' },
          ].map((tip) => (
            <Card key={tip.title} style={styles.nurtureCard}>
              <Text style={styles.nurtureTitle}>{tip.title}</Text>
              <Text style={styles.nurtureSub}>{tip.sub}</Text>
            </Card>
          ))}
        </ScrollView>

        <View style={{ height: spacing['2xl'] }} />
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
    paddingBottom: spacing.lg,
    gap: spacing.base,
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
  heroLabel: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  heroBig: {
    fontSize: 48,
    fontFamily: fonts.headlineExtraBold,
    color: colors.white,
  },
  heroDays: {
    fontSize: 18,
    fontFamily: fonts.bodyMedium,
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  cardGap: {
    marginTop: spacing.xs,
  },
  centered: {
    alignItems: 'center',
  },
  bestNumber: {
    fontSize: 36,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
  },
  bestLabel: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  bestSub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  xpBarWrap: {
    width: '100%',
    marginTop: spacing.md,
  },
  bestProgress: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  pauseCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  pauseHeadline: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  pauseQuote: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    fontStyle: 'italic',
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  pauseLink: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.chip,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.white,
  },
  metricLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.base,
  },
  ninetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  ninetyText: {
    flex: 1,
  },
  ninetyBig: {
    fontSize: 20,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
  },
  ninetySub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  ringPercent: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  insightRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurface,
    lineHeight: 22,
  },
  monthlySalutation: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  monthlyBody: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: spacing.base,
  },
  harmonyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  harmonyPercent: {
    fontSize: 14,
    fontFamily: fonts.headlineBold,
    color: colors.white,
  },
  harmonyLabel: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
  },
  harmonySub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  journalRange: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  journalBody: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  bioRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  bioLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurface,
  },
  bioValue: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  nurtureScroll: {
    marginLeft: -spacing.lg,
    paddingLeft: spacing.lg,
    marginBottom: spacing.base,
  },
  nurtureCard: {
    width: 200,
    marginRight: spacing.md,
  },
  nurtureTitle: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  nurtureSub: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
});
