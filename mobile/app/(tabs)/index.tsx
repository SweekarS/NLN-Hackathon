import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

import { colors, fonts, spacing, radii, shadow, botanicalGradient } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
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
  const { currentStreak, level, totalXP, tasks, todayCompletions, avatarImage } = useAppStore();
  const [achievementVisible, setAchievementVisible] = useState(false);

  const progress = tasks.length > 0 ? todayCompletions.length / tasks.length : 0;

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

        {/* Hero Affirmation */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <LightCard style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Grow at your own pace today.</Text>
                <Text style={styles.heroSubtitle}>
                  Every small step nurtures your sanctuary.
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
            <StatCard iconName="flame-outline" value={String(currentStreak)} label="CURRENT STREAK" delay={0} />
            <StatCard iconName="checkmark-circle-outline" value="85%" label="WEEKLY AVG" delay={100} />
          </View>
          <View style={styles.statsRow}>
            <StatCard iconName="sparkles-outline" value={`Lvl ${level}`} label="GROWTH TIER" delay={200} />
            <StatCard iconName="trending-up-outline" value={`${(totalXP / 1000).toFixed(1)}k`} label="TOTAL XP" delay={300} />
          </View>
        </View>

        {/* Mindfulness Flow */}
        <SectionTitle title="Mindfulness Flow" />
        <Animated.View entering={FadeInUp.delay(350).duration(500)}>
          <Card>
            <Heatmap />
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
                    {todayCompletions.length} of {tasks.length} rituals complete
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.white} />
              </View>
            </GreenCard>
          </Pressable>
        </Animated.View>

        {/* Recent Milestones */}
        <SectionTitle
          title="Recent Milestones"
          actionLabel="View all"
          onAction={() => {}}
        />
        <Animated.View entering={FadeInUp.delay(550).duration(500)}>
          <Pressable onPress={() => setAchievementVisible(true)}>
            <Card style={styles.milestoneCard}>
              <View style={styles.milestoneRow}>
                <IconCircle name="trophy-outline" size="md" />
                <View style={styles.milestoneText}>
                  <Text style={styles.milestoneTitle}>7-Day Streak</Text>
                  <Text style={styles.milestoneLabel}>Consistency badge</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.outline} />
              </View>
            </Card>
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
  milestoneCard: {
    marginBottom: spacing.xs,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneText: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  milestoneLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
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
});
