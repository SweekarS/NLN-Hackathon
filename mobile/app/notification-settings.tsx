import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { GreenCard } from '../components/ui/GreenCard';
import { Toggle } from '../components/ui/Toggle';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { IconCircle } from '../components/ui/IconCircle';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, spacing, radii } from '../theme';

export default function NotificationsScreen() {
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    notifDailyRituals,
    setNotifDailyRituals,
    notifEncouragement,
    setNotifEncouragement,
    notifProgressNudges,
    setNotifProgressNudges,
  } = useAppStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backRow}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
            <Text style={styles.backLabel}>Settings</Text>
          </Pressable>

          <Text style={styles.headline}>Notification Center</Text>
          <Text style={styles.subtitle}>
            Tune your sanctuary's gentle reminders
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(100)}>
          <GreenCard style={styles.masterCard}>
            <View style={styles.masterRow}>
              <Text style={styles.masterLabel}>
                Enable all organic reminders
              </Text>
              <Toggle
                value={notificationsEnabled}
                onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              />
            </View>
          </GreenCard>
        </Animated.View>

        <SectionTitle title="Guidance Types" />

        <Animated.View entering={FadeIn.duration(500).delay(400)}>
          <Card>
            <View style={styles.toggleRow}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                }}
              >
                <IconCircle name="calendar-outline" size="sm" />
                <Text style={styles.toggleLabel}>Daily Rituals</Text>
              </View>
              <Toggle
                value={notifDailyRituals}
                onToggle={() => setNotifDailyRituals(!notifDailyRituals)}
              />
            </View>
            <View style={[styles.toggleRow, styles.toggleRowBorder]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                }}
              >
                <IconCircle name="heart-outline" size="sm" />
                <Text style={styles.toggleLabel}>Encouragement</Text>
              </View>
              <Toggle
                value={notifEncouragement}
                onToggle={() => setNotifEncouragement(!notifEncouragement)}
              />
            </View>
            <View style={styles.toggleRow}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                }}
              >
                <IconCircle name="refresh-outline" size="sm" />
                <Text style={styles.toggleLabel}>Progress Nudges</Text>
              </View>
              <Toggle
                value={notifProgressNudges}
                onToggle={() => setNotifProgressNudges(!notifProgressNudges)}
              />
            </View>
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
});
