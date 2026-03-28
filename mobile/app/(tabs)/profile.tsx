import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { colors, fonts, spacing, radii, shadow, botanicalGradient } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { GreenCard } from '../../components/ui/GreenCard';
import { XPBar } from '../../components/ui/XPBar';
import { Toggle } from '../../components/ui/Toggle';
import { SectionTitle } from '../../components/ui/SectionTitle';

const NEXT_LEVEL_XP_STEP = 200;

interface PathStep {
  label: string;
  completed: boolean;
  current: boolean;
}

export default function ProfileScreen() {
  const { userName, level, levelTitle, totalXP, currentStreak } = useAppStore();

  const nextLevelXP = level * NEXT_LEVEL_XP_STEP;
  const xpProgress = Math.min(totalXP / nextLevelXP, 1);

  const [showProfile, setShowProfile] = useState(false);
  const [shareAchievements, setShareAchievements] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const pathSteps: PathStep[] = [
    { label: 'Rookie', completed: true, current: false },
    { label: 'Regular', completed: true, current: false },
    { label: 'Master', completed: false, current: levelTitle === 'Master' },
    { label: 'Legend', completed: false, current: false },
  ];

  const recentGrowth = [
    { emoji: '🧘', title: 'Morning Meditation', xp: 150 },
    { emoji: '🔥', title: 'Weekly Streak Bonus', xp: 500 },
    { emoji: '🌬️', title: 'Deep Breathing', xp: 50 },
  ];

  const accountRows = [
    { label: 'Settings', route: '/settings', color: colors.onSurface },
    { label: 'Notifications', route: '/notifications', color: colors.onSurface },
    { label: 'Safety Resources', route: '/safety', color: colors.onSurface },
    { label: 'Sign Out', route: null, color: colors.onSurfaceVariant },
    { label: 'Delete Account', route: null, color: colors.error },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <LinearGradient
              colors={[...botanicalGradient.colors]}
              start={botanicalGradient.start}
              end={botanicalGradient.end}
              style={styles.topAvatar}
            >
              <Ionicons name="person" size={20} color={colors.white} />
            </LinearGradient>
            <Text style={styles.topTitle}>Profile</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <Ionicons name="settings-outline" size={24} color={colors.onSurface} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <Card>
            <View style={styles.centered}>
              <View style={styles.avatarWrap}>
                <LinearGradient
                  colors={[...botanicalGradient.colors]}
                  start={botanicalGradient.start}
                  end={botanicalGradient.end}
                  style={styles.avatarBig}
                >
                  <Ionicons name="person" size={40} color={colors.white} />
                </LinearGradient>
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={12} color={colors.onSurface} />
                </View>
              </View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>Mindfulness Practitioner</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>12 Days</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>48 Sessions</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Level Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Card style={styles.cardGap}>
            <View style={styles.levelRow}>
              <LinearGradient
                colors={[...botanicalGradient.colors]}
                start={botanicalGradient.start}
                end={botanicalGradient.end}
                style={styles.levelCircle}
              >
                <Text style={styles.levelNum}>{level}</Text>
                <Text style={styles.levelLabel}>LEVEL</Text>
              </LinearGradient>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{levelTitle}</Text>
                <Text style={styles.levelXP}>
                  {totalXP} / {nextLevelXP} XP
                </Text>
                <XPBar progress={xpProgress} height={10} />
              </View>
            </View>
            <Text style={styles.levelRemaining}>
              {nextLevelXP - totalXP > 0 ? nextLevelXP - totalXP : 0} XP until Level {level + 1}
            </Text>
          </Card>
        </Animated.View>

        {/* Next Milestone */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <GreenCard style={styles.cardGap}>
            <View style={styles.milestoneRow}>
              <Text style={styles.milestoneStar}>⭐</Text>
              <Text style={styles.milestoneText}>Next Milestone: Nature Sage</Text>
            </View>
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneBadgeText}>🔒 Level 15</Text>
            </View>
          </GreenCard>
        </Animated.View>

        {/* Daily Streak Mini */}
        <Card style={styles.cardGap}>
          <Text style={styles.streakTitle}>🔥 {currentStreak} Days</Text>
          <XPBar progress={0.7} height={8} />
          <Text style={styles.streakSub}>+50 XP bonus in 3 days</Text>
        </Card>

        {/* Path to Legend */}
        <View style={styles.pathContainer}>
          {pathSteps.map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <View
                  style={[
                    styles.pathLine,
                    { backgroundColor: step.completed || step.current ? colors.primary : colors.outlineVariant },
                  ]}
                />
              )}
              <View style={styles.pathStep}>
                <View
                  style={[
                    styles.pathCircle,
                    step.completed && styles.pathCircleCompleted,
                    step.current && styles.pathCircleCurrent,
                    !step.completed && !step.current && styles.pathCircleLocked,
                  ]}
                >
                  {step.completed ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : step.current ? (
                    <View style={styles.pathDot} />
                  ) : (
                    <Ionicons name="lock-closed" size={10} color={colors.outline} />
                  )}
                </View>
                <Text
                  style={[
                    styles.pathLabel,
                    step.current && styles.pathLabelCurrent,
                    !step.completed && !step.current && styles.pathLabelLocked,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Recent Growth */}
        <SectionTitle title="Recent Growth" />
        {recentGrowth.map((item) => (
          <Card key={item.title} style={styles.growthCard}>
            <View style={styles.growthRow}>
              <Text style={styles.growthEmoji}>{item.emoji}</Text>
              <Text style={styles.growthTitle}>{item.title}</Text>
              <Text style={styles.growthXP}>+{item.xp} XP</Text>
            </View>
          </Card>
        ))}

        {/* Visibility & Social */}
        <SectionTitle title="Visibility & Social" />
        <Card style={styles.cardGap}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show profile to others</Text>
            <Toggle value={showProfile} onToggle={() => setShowProfile((v) => !v)} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Share achievements</Text>
            <Toggle value={shareAchievements} onToggle={() => setShareAchievements((v) => !v)} />
          </View>
        </Card>

        {/* Accessibility */}
        <SectionTitle title="Accessibility" />
        <Card style={styles.cardGap}>
          <Pressable style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Large Text</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.outline} />
          </Pressable>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>High Contrast</Text>
            <Toggle value={highContrast} onToggle={() => setHighContrast((v) => !v)} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Screen Reader</Text>
            <Toggle value={screenReader} onToggle={() => setScreenReader((v) => !v)} />
          </View>
        </Card>

        {/* Account */}
        <SectionTitle title="Account" />
        <Card style={styles.cardGap}>
          {accountRows.map((row, i) => (
            <Pressable
              key={row.label}
              style={[styles.accountRow, i < accountRows.length - 1 && styles.accountRowBorder]}
              onPress={() => row.route && router.push(row.route as any)}
            >
              <Text style={[styles.accountLabel, { color: row.color }]}>{row.label}</Text>
              {row.route && <Ionicons name="chevron-forward" size={20} color={colors.outline} />}
            </Pressable>
          ))}
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLinks}>Privacy · Terms · What We Track</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>

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
    gap: spacing.xs,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
  },
  centered: {
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: spacing.md,
  },
  avatarBig: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
  },
  userRole: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
    gap: spacing.base,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.outlineVariant,
  },
  cardGap: {
    marginTop: spacing.xs,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  levelCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNum: {
    fontSize: 24,
    fontFamily: fonts.headlineExtraBold,
    color: colors.white,
  },
  levelLabel: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
    letterSpacing: 0.5,
    marginTop: -2,
  },
  levelInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  levelTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  levelXP: {
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  levelRemaining: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  milestoneStar: {
    fontSize: 20,
  },
  milestoneText: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.white,
  },
  milestoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  milestoneBadgeText: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  streakSub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  pathStep: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  pathCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathCircleCompleted: {
    backgroundColor: colors.primary,
  },
  pathCircleCurrent: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pathCircleLocked: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  pathDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  pathLine: {
    height: 2,
    width: 24,
    marginBottom: 20,
  },
  pathLabel: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  pathLabelCurrent: {
    color: colors.primary,
    fontFamily: fonts.headlineBold,
  },
  pathLabelLocked: {
    color: colors.outline,
  },
  growthCard: {
    marginTop: spacing.sm,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  growthEmoji: {
    fontSize: 24,
  },
  growthTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  growthXP: {
    fontSize: 14,
    fontFamily: fonts.headlineBold,
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurface,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  accountLabel: {
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  footerLinks: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.outline,
  },
  footerVersion: {
    fontSize: 11,
    fontFamily: fonts.bodyRegular,
    color: colors.outlineVariant,
  },
});
