import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

import { colors, fonts, spacing, radii, shadow } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { SectionTitle } from '../components/ui/SectionTitle';
import { SelectorPill } from '../components/ui/SelectorPill';
import { FieldInput } from '../components/ui/FieldInput';
import { FieldLabel } from '../components/ui/FieldLabel';

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const ACTIVE_TASKS: { id: string; icon: string; title: string; timeOfDay: TimeOfDay }[] = [
  { id: '1', icon: '🌬️', title: 'Deep Breathing Ritual', timeOfDay: 'morning' },
  { id: '2', icon: '💧', title: 'Hydration Target', timeOfDay: 'afternoon' },
  { id: '3', icon: '📝', title: 'Gratitude Log', timeOfDay: 'evening' },
];

const TIME_BADGE_COLORS: Record<TimeOfDay, string> = {
  morning: '#FFF3E0',
  afternoon: '#E8F7EF',
  evening: '#EDE7F6',
};

export default function CustomizeScreen() {
  const { tasks, toggleTaskEnabled, addTask } = useAppStore();
  const [taskName, setTaskName] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning');

  const usedSlots = tasks.length;
  const totalSlots = 6;

  const handleAdd = () => {
    if (!taskName.trim()) return;
    addTask({
      id: Date.now().toString(),
      icon: '🌿',
      title: taskName.trim(),
      subtitle: 'Custom ritual',
      timeOfDay: selectedTime,
      enabled: true,
    });
    setTaskName('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </Pressable>
        </Animated.View>

        {/* Badge Chip */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Structure Your Day</Text>
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Text style={styles.headline}>
            Craft your daily{' '}
            <Text style={styles.headlineAccent}>rhythm.</Text>
          </Text>
          <Text style={styles.subtitleText}>
            Design a routine that honors your energy and needs.
          </Text>
        </Animated.View>

        {/* New Ritual Card */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Card style={styles.ritualCard}>
            <View style={styles.ritualHeader}>
              <Text style={styles.ritualTitle}>Add a Ritual</Text>
              <Text style={styles.slotsLabel}>
                {Math.min(usedSlots, totalSlots)} of {totalSlots} slots used
              </Text>
            </View>

            <View style={styles.dotsRow}>
              {Array.from({ length: totalSlots }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i < usedSlots ? colors.primary : colors.surfaceMid,
                    },
                  ]}
                />
              ))}
            </View>

            <FieldLabel label="Ritual Name" />
            <FieldInput
              value={taskName}
              onChangeText={setTaskName}
              placeholder="e.g. Sunset Meditation"
            />

            <FieldLabel label="Daily Schedule" />
            <View style={styles.pillRow}>
              <SelectorPill
                label="Morning"
                selected={selectedTime === 'morning'}
                onPress={() => setSelectedTime('morning')}
              />
              <SelectorPill
                label="Afternoon"
                selected={selectedTime === 'afternoon'}
                onPress={() => setSelectedTime('afternoon')}
              />
              <SelectorPill
                label="Evening"
                selected={selectedTime === 'evening'}
                onPress={() => setSelectedTime('evening')}
              />
            </View>

            <Button
              title="Add to Sanctuary"
              onPress={handleAdd}
              variant="primary"
              style={styles.addBtn}
              disabled={!taskName.trim()}
            />
          </Card>
        </Animated.View>

        {/* Active Journey */}
        <SectionTitle title="Active Journey" actionLabel="Drag to reorder" />

        {ACTIVE_TASKS.map((item, idx) => {
          const storeTask = tasks.find((t) => t.id === item.id);
          const enabled = storeTask?.enabled ?? true;
          return (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(400 + idx * 80).duration(500)}
            >
              <Card style={styles.taskRow}>
                <View style={styles.taskRowLeft}>
                  <Text style={styles.taskIcon}>{item.icon}</Text>
                  <View style={styles.taskRowText}>
                    <Text style={styles.taskRowTitle}>{item.title}</Text>
                    <View
                      style={[
                        styles.timeBadge,
                        { backgroundColor: TIME_BADGE_COLORS[item.timeOfDay] },
                      ]}
                    >
                      <Text style={styles.timeBadgeText}>
                        {item.timeOfDay.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <Toggle
                  value={enabled}
                  onToggle={() => toggleTaskEnabled(item.id)}
                />
              </Card>
            </Animated.View>
          );
        })}

        {/* Bottom Actions */}
        <Animated.View
          entering={FadeInUp.delay(650).duration(500)}
          style={styles.bottomActions}
        >
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            style={styles.bottomBtn}
          />
          <Button
            title="Save Routine"
            onPress={() => router.back()}
            variant="primary"
            style={styles.bottomBtn}
          />
        </Animated.View>

        <View style={{ height: spacing['3xl'] }} />
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
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLighter,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  headline: {
    fontSize: 30,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  headlineAccent: {
    fontStyle: 'italic',
    color: colors.primary,
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  ritualCard: {
    marginBottom: spacing.sm,
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ritualTitle: {
    fontSize: 17,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  slotsLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.outline,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addBtn: {
    marginTop: spacing.lg,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  taskRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskRowText: {
    flex: 1,
    gap: 4,
  },
  taskRowTitle: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  timeBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  timeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  bottomBtn: {
    flex: 1,
  },
});
