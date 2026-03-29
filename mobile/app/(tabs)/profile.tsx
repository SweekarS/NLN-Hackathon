import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import { colors, fonts, spacing, radii, shadow, botanicalGradient } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { xpProgressInCurrentLevel } from '../../lib/dashboard-stats';
import { Card } from '../../components/ui/Card';
import { GreenCard } from '../../components/ui/GreenCard';
import { XPBar } from '../../components/ui/XPBar';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { IconCircle } from '../../components/ui/IconCircle';

const XP_PER_LEVEL = 500;

interface PathStep {
  label: string;
  completed: boolean;
  current: boolean;
}

type AccountRow =
  | { kind: 'link'; label: string; route: '/settings' | '/notifications' | '/safety'; color: string }
  | { kind: 'signOut'; label: string; color: string }
  | { kind: 'delete'; label: string; color: string };

export default function ProfileScreen() {
  const { userName, avatarImage, level, levelTitle, totalXP, currentStreak, totalSessionsCompleted, syncUserStats, resetLocalSession } = useAppStore();

  useFocusEffect(
    useCallback(() => {
      syncUserStats();
    }, [syncUserStats])
  );

  const { intoLevel, nextLevelTotal } = xpProgressInCurrentLevel(totalXP);
  const xpProgress = Math.min(intoLevel / XP_PER_LEVEL, 1);

  const pathSteps: PathStep[] = [
    { label: 'Seeker', completed: level > 5, current: levelTitle === 'Seeker' },
    { label: 'Explorer', completed: level > 15, current: levelTitle === 'Explorer' },
    { label: 'Architect', completed: level > 30, current: levelTitle === 'Architect' },
    { label: 'Sanctuary Master', completed: level >= 31, current: levelTitle === 'Sanctuary Master' },
  ];

  const recentGrowth = [
    { iconName: 'body-outline' as const, title: 'Morning Meditation', xp: 150 },
    { iconName: 'flame-outline' as const, title: 'Weekly Streak Bonus', xp: 500 },
    { iconName: 'leaf-outline' as const, title: 'Deep Breathing', xp: 50 },
  ];

  const accountRows: AccountRow[] = [
    { kind: 'link', label: 'Settings', route: '/settings', color: colors.onSurface },
    { kind: 'link', label: 'Notifications', route: '/notifications', color: colors.onSurface },
    { kind: 'link', label: 'Safety Resources', route: '/safety', color: colors.onSurface },
    { kind: 'signOut', label: 'Sign Out', color: colors.onSurfaceVariant },
    { kind: 'delete', label: 'Delete Account', color: colors.error },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'You will return to the welcome screen. Data on this device is kept until you delete it or remove the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: () => {
            resetLocalSession();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete local data',
      'This clears all app data stored on this device. After you connect Supabase, you can also remove your account from the server.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            resetLocalSession();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

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
            {avatarImage ? (
              <Image source={{ uri: avatarImage }} style={[styles.topAvatar, { resizeMode: 'cover' }]} />
            ) : (
              <LinearGradient
                colors={[...botanicalGradient.colors]}
                start={botanicalGradient.start}
                end={botanicalGradient.end}
                style={styles.topAvatar}
              >
                <Ionicons name="person" size={20} color={colors.white} />
              </LinearGradient>
            )}
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
              <Pressable
                style={styles.avatarWrap}
                onPress={() => router.push('/edit-profile')}
                hitSlop={10}
              >
                {avatarImage ? (
                  <Image source={{ uri: avatarImage }} style={[styles.avatarBig, { resizeMode: 'cover' }]} />
                ) : (
                  <LinearGradient
                    colors={[...botanicalGradient.colors]}
                    start={botanicalGradient.start}
                    end={botanicalGradient.end}
                    style={styles.avatarBig}
                  >
                    <Ionicons name="person" size={40} color={colors.white} />
                  </LinearGradient>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={12} color={colors.onSurface} />
                </View>
              </Pressable>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>Mindfulness Practitioner</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentStreak} Days</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalXP}</Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </View>
              </View>
              <Text style={styles.sessionsSub}>
                {totalSessionsCompleted} session{totalSessionsCompleted === 1 ? '' : 's'} logged
              </Text>
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
                  {totalXP} / {nextLevelTotal} XP
                </Text>
                <XPBar progress={xpProgress} height={10} />
              </View>
            </View>
            <Text style={styles.levelRemaining}>
              {nextLevelTotal - totalXP > 0 ? nextLevelTotal - totalXP : 0} XP until Level {level + 1}
            </Text>
          </Card>
        </Animated.View>

        {/* Next Milestone */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <GreenCard style={styles.cardGap}>
            <View style={styles.milestoneRow}>
              <IconCircle name="star-outline" size="sm" color={colors.white} bg="rgba(255,255,255,0.25)" />
              <Text style={styles.milestoneText}>Next Milestone: Nature Sage</Text>
            </View>
            <View style={styles.milestoneBadge}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.milestoneBadgeText}>Level 15</Text>
            </View>
          </GreenCard>
        </Animated.View>

        {/* Daily Streak Mini */}
        <Card style={styles.cardGap}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
            <IconCircle name="flame-outline" size="sm" />
            <Text style={[styles.streakTitle, { marginBottom: 0 }]}>{currentStreak} Days</Text>
          </View>
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
              <IconCircle name={item.iconName} size="sm" />
              <Text style={styles.growthTitle}>{item.title}</Text>
              <Text style={styles.growthXP}>+{item.xp} XP</Text>
            </View>
          </Card>
        ))}


        {/* Account */}
        <SectionTitle title="Account" />
        <Card style={styles.cardGap}>
          {accountRows.map((row, i) => {
            const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
              Settings: 'settings-outline',
              Notifications: 'notifications-outline',
              'Safety Resources': 'shield-outline',
              'Sign Out': 'log-out-outline',
              'Delete Account': 'close-circle-outline',
            };
            return (
              <Pressable
                key={row.label}
                style={[styles.accountRow, i < accountRows.length - 1 && styles.accountRowBorder]}
                onPress={() => {
                  if (row.kind === 'link') router.push(row.route);
                  else if (row.kind === 'signOut') handleSignOut();
                  else handleDeleteAccount();
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Ionicons name={iconMap[row.label] ?? 'ellipse-outline'} size={20} color={row.color} />
                  <Text style={[styles.accountLabel, { color: row.color }]}>{row.label}</Text>
                </View>
                {row.kind === 'link' && <Ionicons name="chevron-forward" size={20} color={colors.outline} />}
              </Pressable>
            );
          })}
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
  sessionsSub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: 'center',
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
  milestoneText: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.white,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
