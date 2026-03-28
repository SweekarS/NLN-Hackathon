import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { SelectorPill } from '../components/ui/SelectorPill';
import { SectionTitle } from '../components/ui/SectionTitle';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, spacing, radii } from '../theme';

const stressOptions: { label: string; value: 'low' | 'medium' | 'high' }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const themeOptions: { emoji: string; label: string; value: 'light' | 'dark' | 'forest' }[] = [
  { emoji: '☀️', label: 'Light', value: 'light' },
  { emoji: '🌙', label: 'Dark', value: 'dark' },
  { emoji: '🌲', label: 'Forest', value: 'forest' },
];

export default function SettingsScreen() {
  const stressMode = useAppStore((s) => s.stressMode);
  const setStressMode = useAppStore((s) => s.setStressMode);
  const appTheme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashToast = useCallback(() => {
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleStress = (mode: 'low' | 'medium' | 'high') => {
    setStressMode(mode);
    flashToast();
  };

  const handleTheme = (t: 'light' | 'dark' | 'forest') => {
    setTheme(t);
    flashToast();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </Pressable>

          <Text style={styles.headline}>Settings</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(100)}>
          <Card style={styles.sectionCard}>
            <SectionTitle title="Stress Mode" />
            <View style={styles.pillRow}>
              {stressOptions.map((opt) => (
                <SelectorPill
                  key={opt.value}
                  label={opt.label}
                  selected={stressMode === opt.value}
                  onPress={() => handleStress(opt.value)}
                />
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          <Card style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Daily Window</Text>
            <View style={styles.windowRow}>
              <Text style={styles.windowLabel}>Start Time</Text>
              <View style={styles.windowPill}>
                <Text style={styles.windowValue}>8:00 AM</Text>
              </View>
            </View>
            <View style={styles.windowRow}>
              <Text style={styles.windowLabel}>End Time</Text>
              <View style={styles.windowPill}>
                <Text style={styles.windowValue}>10:00 PM</Text>
              </View>
            </View>
            <View style={styles.landscapePlaceholder}>
              <Text style={styles.landscapeEmoji}>🌅</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(300)}>
          <Card style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Language</Text>
            <Pressable style={styles.langRow}>
              <Text style={styles.flag}>🇬🇧</Text>
              <Text style={styles.langText}>English (UK)</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
            <Text style={styles.langNote}>More languages coming in future updates</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(400)}>
          <Card style={styles.sectionCard}>
            <Text style={styles.cardTitle}>Visual Sanctuary</Text>
            <Text style={styles.themeSubtitle}>Choose Your Theme</Text>
            <View style={styles.themeRow}>
              {themeOptions.map((opt) => {
                const selected = appTheme === opt.value;
                const bgColor =
                  opt.value === 'dark'
                    ? colors.onSurface
                    : opt.value === 'forest'
                      ? colors.primary
                      : colors.surfaceLow;
                const textColor =
                  opt.value === 'light' ? colors.onSurface : colors.white;

                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleTheme(opt.value)}
                    style={[
                      styles.themeOption,
                      { backgroundColor: bgColor },
                      selected && styles.themeSelected,
                    ]}
                  >
                    <Text style={styles.themeEmoji}>{opt.emoji}</Text>
                    <Text style={[styles.themeLabel, { color: textColor }]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {showToast && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.toast}
        >
          <Text style={styles.toastText}>Changes saved successfully</Text>
          <Pressable onPress={() => setShowToast(false)} hitSlop={8}>
            <Text style={styles.toastUndo}>UNDO</Text>
          </Pressable>
        </Animated.View>
      )}
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
    marginBottom: spacing.lg,
  },
  headline: {
    fontSize: 28,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
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
    marginTop: spacing.sm,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  windowLabel: {
    fontSize: 15,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  windowPill: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  windowValue: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  landscapePlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  landscapeEmoji: {
    fontSize: 40,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  flag: {
    fontSize: 22,
  },
  langText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  langNote: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  themeSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  themeOption: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeSelected: {
    borderColor: colors.primary,
  },
  themeEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  themeLabel: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.onSurface,
    borderRadius: radii.chip,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toastText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
  },
  toastUndo: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    color: colors.primaryLight,
  },
});
