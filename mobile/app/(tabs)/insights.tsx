import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  ImageBackground,
  Modal,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { colors, fonts, spacing, radii, shadow } from '../../theme';
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

type NurtureEvent = {
  id: string;
  title: string;
  sub: string;
  desc: string;
  image: ImageSourcePropType;
  date: string;
};

const NURTURE_EVENTS: NurtureEvent[] = [
  {
    id: 'digital_detox',
    title: 'Digital Detox',
    sub: 'Disconnect and recharge',
    desc: 'Join our community for a weekend digital detox challenge to reset your mind and regain focus. Learn the science of disconnecting and reclaim your time.',
    image: require('../../assets/images/digital_detox.png'),
    date: 'Starts Friday, 8 PM',
  },
  {
    id: 'sunset_yoga',
    title: 'Sunset Yoga',
    sub: 'Evening flow in the park',
    desc: "A gentle sunset yoga session to stretch out the day's tension. Suitable for all levels, focusing on breath and slow movement.",
    image: require('../../assets/images/sunset_yoga.png'),
    date: 'Saturday, 6:30 PM',
  },
  {
    id: 'leafy_greens',
    title: 'Plant-based Nutrition',
    sub: 'Nourish your body',
    desc: 'A live workshop mapping out how plant-based eating impacts your overall energy, mental clarity, and focus for daily tasks.',
    image: require('../../assets/images/leafy_greens.png'),
    date: 'Sunday, 11 AM',
  },
];

export default function InsightsScreen() {
  const [selectedEvent, setSelectedEvent] = useState<NurtureEvent | null>(null);
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
            Linking.openURL('sms:').catch(() => { });
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.nurtureScroll}
        >
          {NURTURE_EVENTS.map((event) => (
            <Pressable key={event.id} onPress={() => setSelectedEvent(event)}>
              <ImageBackground
                source={event.image}
                style={styles.nurtureHeroCard}
                imageStyle={styles.nurtureHeroImage}
              >
                <View style={styles.nurtureHeroOverlay}>
                  <View style={styles.nurturePill}>
                    <Text style={styles.nurturePillText}>{event.date}</Text>
                  </View>
                  <View>
                    <Text style={styles.nurtureHeroTitle}>{event.title}</Text>
                    <Text style={styles.nurtureHeroSub}>{event.sub}</Text>
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      {/* Event Modal */}
      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {selectedEvent && (
              <>
                <ImageBackground
                  source={selectedEvent.image}
                  style={styles.modalHero}
                  imageStyle={styles.modalHeroImage}
                >
                  <Pressable
                    style={styles.modalClose}
                    onPress={() => setSelectedEvent(null)}
                  >
                    <Ionicons name="close" size={24} color="#000" />
                  </Pressable>
                </ImageBackground>
                <View style={styles.modalContentWrap}>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedEvent.date}</Text>
                  <Text style={styles.modalDesc}>{selectedEvent.desc}</Text>

                  <Button
                    title="Sign Up"
                    onPress={() => {
                      Alert.alert('Success', `You have signed up for ${selectedEvent.title}!`);
                      setSelectedEvent(null);
                    }}
                    style={{ marginTop: spacing.lg }}
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
  nurtureScroll: {
    marginLeft: -spacing.lg,
    paddingLeft: spacing.lg,
    marginBottom: spacing.base,
  },
  nurtureHeroCard: {
    width: 250,
    height: 180,
    marginRight: spacing.md,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadow.card,
  },
  nurtureHeroImage: {
    borderRadius: radii.card,
  },
  nurtureHeroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  nurturePill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.chip,
    alignSelf: 'flex-start',
  },
  nurturePillText: {
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  nurtureHeroTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.white,
    marginBottom: 2,
  },
  nurtureHeroSub: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  modalHero: {
    width: '100%',
    height: 180,
  },
  modalHeroImage: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  modalContentWrap: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  modalDesc: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
});
