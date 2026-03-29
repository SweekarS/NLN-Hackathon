import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useShallow } from 'zustand/react/shallow';
import { colors, fonts, spacing, radii } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
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
  const [selectedNurtureItem, setSelectedNurtureItem] = useState<{
    id: string;
    category: string;
    title: string;
    buttonText: string;
    image: any;
    description: string;
  } | null>(null);

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
    isHealthConnected,
    biometrics,
    connectHealth,
  } = useAppStore(
    useShallow((s) => ({
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      longestStreakEndDate: s.longestStreakEndDate,
      activeDays90: s.activeDays90,
      dailyLogsByDate: s.dailyLogsByDate,
      todayCompletions: s.todayCompletions,
      tasks: s.tasks,
      lastLogicalDateKey: s.lastLogicalDateKey,
      userName: s.userName,
      unreadCount: s.unreadCount,
      isHealthConnected: s.isHealthConnected,
      biometrics: s.biometrics,
      connectHealth: s.connectHealth,
    })),
  );

  const { completedTodayCount, hasEnabledTasks } = useMemo(() => {
    const enabled = tasks.filter((t) => t.enabled);
    const completedTodayCount = todayCompletions.filter((id) =>
      enabled.some((t) => t.id === id),
    ).length;
    return {
      completedTodayCount,
      hasEnabledTasks: enabled.length > 0,
    };
  }, [todayCompletions, tasks]);

  const nudgeShownRef = useRef(false);

  useEffect(() => {
    if (!isHealthConnected) {
      nudgeShownRef.current = false;
      return;
    }
    const noTasksDoneToday =
      hasEnabledTasks && completedTodayCount === 0;
    const lowEnergy =
      biometrics.steps < 4000 ||
      biometrics.sleepHours < 5.5 ||
      noTasksDoneToday;
    if (!lowEnergy) return;
    if (nudgeShownRef.current) return;
    nudgeShownRef.current = true;
    Alert.alert(
      'Low Battery Detected',
      "You've had less rest and movement than usual lately. Everything okay? It's okay to take a break. Do you want to check in with your squad?",
      [
        { text: "I'm okay", style: 'cancel' },
        {
          text: 'Message Squad',
          onPress: () => {
            Linking.openURL('sms:').catch(() => {});
          },
        },
      ],
    );
  }, [
    isHealthConnected,
    biometrics.steps,
    biometrics.sleepHours,
    biometrics.socialBattery,
    completedTodayCount,
    hasEnabledTasks,
  ]);

  const anchorDate = lastLogicalDateKey ?? getLogicalDateString();
  const todayFlags = flagsFromTaskIds(todayCompletions, tasks);

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
        nestedScrollEnabled
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
            A week of steady morning Conditioning and evening reflections. Your
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

        {/* Biometric Trends (simulated Apple Health when connected) */}
        <SectionTitle title="Biometric Trends" />
        <Card style={styles.cardGap}>
          {!isHealthConnected ? (
            <Pressable
              onPress={() => connectHealth()}
              style={({ pressed }) => [
                styles.healthSyncButton,
                pressed && styles.healthSyncButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sync with Apple Health and Fitness"
            >
              <Ionicons
                name="heart-circle"
                size={22}
                color="#FFFFFF"
                style={styles.healthSyncIcon}
              />
              <Text style={styles.healthSyncLabel}>
                Sync with Apple Health & Fitness
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="rgba(255,255,255,0.65)"
              />
            </Pressable>
          ) : (
            [
              {
                icon: 'footsteps-outline' as const,
                label: '👟 Daily Steps',
                value: biometrics.steps.toLocaleString(),
              },
              {
                icon: 'bed-outline' as const,
                label: '🌙 Sleep Quality',
                value: `${biometrics.sleepHours.toFixed(1)} hrs`,
              },
              {
                icon: 'battery-charging-outline' as const,
                label: '🔋 Social Battery',
                value: `${biometrics.socialBattery}%`,
              },
            ].map((item, i, arr) => (
              <View
                key={item.label}
                style={[
                  styles.bioRow,
                  i < arr.length - 1 && styles.bioRowBorder,
                ]}
              >
                <IconCircle name={item.icon} size="sm" />
                <Text style={styles.bioLabel}>{item.label}</Text>
                <Text style={styles.bioValue}>{item.value}</Text>
              </View>
            ))
          )}
        </Card>

        {/* Nurture Your Next Week */}
        <SectionTitle title="Nurture Your Next Week" />
        <View style={styles.nurtureList}>
          {[
            {
              id: 'sunset_yoga',
              category: 'MORNING CONDITIONING',
              title: 'Try Sunset Yoga',
              buttonText: 'EXPLORE ROUTINE',
              image: require('../../assets/images/sunset_yoga.png'),
              description: 'Start your morning with a 15-minute sunset yoga routine to awaken your body and focus your mind. Perfect for early risers to center themselves before the day begins.'
            },
            {
              id: 'leafy_greens',
              category: 'INTERNAL HEALTH',
              title: 'Leafy Greens Prep',
              buttonText: 'RECIPE PACK',
              image: require('../../assets/images/leafy_greens.png'),
              description: 'Nourish your body from the inside out. This pack includes 5 easy, delicious leafy green recipes that you can prep on Sunday for a vibrant week.'
            },
            {
              id: 'digital_detox',
              category: 'RESTORATIVE SLEEP',
              title: 'Digital Detox Hour',
              buttonText: 'SCHEDULE ALERT',
              image: require('../../assets/images/digital_detox.png'),
              description: 'Reclaim your sleep quality by disconnecting from all screens one hour before bed. Set up an automated alert to remind you to power down.'
            },
          ].map((item) => (
            <Animated.View key={item.id} entering={FadeIn.duration(400)}>
              <Pressable onPress={() => setSelectedNurtureItem(item)}>
                <View style={styles.newNurtureCard}>
                  <Image source={item.image} style={styles.nurtureImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                    style={styles.nurtureGradient}
                  >
                    <Text style={styles.nurtureCategory}>{item.category}</Text>
                    <Text style={styles.nurtureMainTitle}>{item.title}</Text>
                    <Pressable
                      style={styles.nurtureBtn}
                      onPress={() => setSelectedNurtureItem(item)}
                    >
                      <Text style={styles.nurtureBtnText}>{item.buttonText}</Text>
                    </Pressable>
                  </LinearGradient>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={!!selectedNurtureItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedNurtureItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedNurtureItem && (
              <>
                <View style={styles.modalImageContainer}>
                  <Image source={selectedNurtureItem.image} style={styles.modalImage} />
                  <Pressable style={styles.modalClose} onPress={() => setSelectedNurtureItem(null)}>
                    <Ionicons name="close-circle" size={32} color="#FFF" />
                  </Pressable>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.modalCategory}>{selectedNurtureItem.category}</Text>
                  <Text style={styles.modalTitle}>{selectedNurtureItem.title}</Text>
                  <Text style={styles.modalDesc}>{selectedNurtureItem.description}</Text>
                  <Button 
                    title={`Sign Up for ${selectedNurtureItem.title}`}
                    onPress={() => {
                      Alert.alert('Success', "You've been signed up for this event!");
                      setSelectedNurtureItem(null);
                    }}
                    style={{ marginTop: spacing.xl, marginBottom: spacing.lg }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.surface,
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
  healthSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  healthSyncButtonPressed: {
    opacity: 0.88,
  },
  healthSyncIcon: {
    marginRight: 2,
  },
  healthSyncLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  nurtureList: {
    gap: spacing.base,
  },
  newNurtureCard: {
    width: '100%',
    height: 200,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
  },
  nurtureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  nurtureGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.base,
  },
  nurtureCategory: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nurtureMainTitle: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fonts.headlineBold,
    marginBottom: spacing.md,
  },
  nurtureBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nurtureBtnText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalImageContainer: {
    position: 'relative',
    height: 220,
    width: '100%',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalCategory: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  modalTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontFamily: fonts.headlineBold,
    marginBottom: spacing.base,
  },
  modalDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    lineHeight: 24,
  },
});
