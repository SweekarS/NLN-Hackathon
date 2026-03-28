import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { colors, fonts, spacing, radii } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { GreenCard } from '../../components/ui/GreenCard';
import { LightCard } from '../../components/ui/LightCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { XPBar } from '../../components/ui/XPBar';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { BarChart } from '../../components/ui/BarChart';
import { Heatmap } from '../../components/ui/Heatmap';
import { SectionTitle } from '../../components/ui/SectionTitle';

type MetricsTab = 'overview' | 'details';

export default function InsightsScreen() {
  const { currentStreak, longestStreak } = useAppStore();
  const [activeTab, setActiveTab] = useState<MetricsTab>('overview');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
              onPress={() => {}}
              variant="light"
              style={{ marginTop: spacing.base }}
            />
          </GreenCard>
        </Animated.View>

        {/* Personal Best */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Card style={styles.cardGap}>
            <View style={styles.centered}>
              <View style={styles.trophyCircle}>
                <Text style={styles.trophyEmoji}>🏆</Text>
              </View>
              <Text style={styles.bestNumber}>{longestStreak}</Text>
              <Text style={styles.bestLabel}>Personal Best</Text>
              <Text style={styles.bestSub}>Achieved on June 12</Text>
              <View style={styles.xpBarWrap}>
                <XPBar progress={0.33} height={6} color={colors.primaryLight} />
              </View>
              <Text style={styles.bestProgress}>33% toward a new record</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Embracing the Pause */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <LightCard style={styles.pauseCard}>
            <Text style={styles.pauseHeadline}>Embracing the Pause</Text>
            <Text style={styles.pauseQuote}>
              "Rest is how nature renews itself. Your pause is part of your growth story."
            </Text>
            <Text style={styles.pauseLink}>✨ Gentle Reminders for Healing</Text>
          </LightCard>
        </Animated.View>

        {/* Consistency Metrics */}
        <SectionTitle title="Consistency Metrics" />

        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </Pressable>
        </View>

        <Card style={styles.cardGap}>
          <Text style={styles.metricLabel}>Last 7 Days</Text>
          <BarChart />

          <View style={styles.divider} />

          <Text style={styles.metricLabel}>Last 30 Days</Text>
          <Heatmap />

          <View style={styles.divider} />

          <Text style={styles.metricLabel}>Last 90 Days</Text>
          <View style={styles.ninetyRow}>
            <ProgressRing progress={0.72} size={60} strokeWidth={7}>
              <Text style={styles.ringPercent}>72%</Text>
            </ProgressRing>
            <View style={styles.ninetyText}>
              <Text style={styles.ninetyBig}>72%</Text>
              <Text style={styles.ninetySub}>Active: 65 days · Rest: 25 days</Text>
            </View>
          </View>
        </Card>

        {/* Journey Insights */}
        <Animated.View entering={FadeIn.delay(300).duration(500)}>
          <Card style={styles.cardGap}>
            <View style={styles.insightRow}>
              <Text style={styles.insightLeaf}>🍃</Text>
              <Text style={styles.insightText}>
                Your evening wind-down consistency has improved 23% this month. Keep nurturing this
                habit.
              </Text>
            </View>
          </Card>
        </Animated.View>

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
    padding: spacing.lg,
    gap: spacing.base,
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
  trophyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  trophyEmoji: {
    fontSize: 28,
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
  insightLeaf: {
    fontSize: 24,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurface,
    lineHeight: 22,
  },
});
