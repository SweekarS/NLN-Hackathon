import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { GreenCard } from '../components/ui/GreenCard';
import { Toggle } from '../components/ui/Toggle';
import { SelectorPill } from '../components/ui/SelectorPill';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, spacing, radii } from '../theme';

const reminderOptions: { label: string; value: '8am' | '10am' | 'off' }[] = [
  { label: '8:00 AM', value: '8am' },
  { label: '10:00 AM', value: '10am' },
  { label: 'Off', value: 'off' },
];

export default function NotificationsScreen() {
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const reminderTime = useAppStore((s) => s.reminderTime);
  const setReminderTime = useAppStore((s) => s.setReminderTime);

  const [dailyRituals, setDailyRituals] = useState(true);
  const [encouragement, setEncouragement] = useState(true);
  const [progressNudges, setProgressNudges] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
            <Text style={styles.backLabel}>Settings</Text>
          </Pressable>

          <Text style={styles.headline}>Notification Center</Text>
          <Text style={styles.subtitle}>Tune your sanctuary's gentle reminders</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(100)}>
          <GreenCard style={styles.masterCard}>
            <View style={styles.masterRow}>
              <Text style={styles.masterLabel}>Enable all organic reminders</Text>
              <Toggle
                value={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            </View>
          </GreenCard>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          <Card style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Live Preview</Text>
            <View style={styles.previewMock}>
              <View style={styles.previewIconWrap}>
                <Ionicons name="notifications" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewText}>Time for your evening reflection 🌿</Text>
                <Text style={styles.previewTime}>2 minutes ago</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <SectionTitle title="Reminder Time" />

        <Animated.View entering={FadeIn.duration(500).delay(300)}>
          <View style={styles.pillRow}>
            {reminderOptions.map((opt) => (
              <SelectorPill
                key={opt.value}
                label={opt.label}
                selected={reminderTime === opt.value}
                onPress={() => setReminderTime(opt.value)}
              />
            ))}
          </View>
        </Animated.View>

        <SectionTitle title="Guidance Types" />

        <Animated.View entering={FadeIn.duration(500).delay(400)}>
          <Card>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Daily Rituals</Text>
              <Toggle value={dailyRituals} onToggle={() => setDailyRituals(!dailyRituals)} />
            </View>
            <View style={[styles.toggleRow, styles.toggleRowBorder]}>
              <Text style={styles.toggleLabel}>Encouragement</Text>
              <Toggle value={encouragement} onToggle={() => setEncouragement(!encouragement)} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Progress Nudges</Text>
              <Toggle value={progressNudges} onToggle={() => setProgressNudges(!progressNudges)} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(500)}>
          <Card style={[styles.sectionCard, { backgroundColor: colors.surfaceLow }]}>
            <Text style={styles.cardTitle}>Snooze Settings</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>15 min</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Limit</Text>
              <Text style={styles.infoValue}>3 times</Text>
            </View>
            <Button title="Quick Snooze Until 2PM" variant="ghost" onPress={() => {}} />
          </Card>
        </Animated.View>
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
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  backLabel: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  headline: {
    fontSize: 28,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  masterCard: {
    marginBottom: spacing.base,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
    marginRight: spacing.md,
  },
  sectionCard: {
    marginTop: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  previewMock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  previewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  previewTime: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.outline,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  toggleRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.outlineVariant,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
});
