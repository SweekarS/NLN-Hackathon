import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { GreenCard } from '../components/ui/GreenCard';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, spacing, radii, shadow } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const journeyOptions = [
  { key: 'solo' as const, icon: '🧘', title: 'Solo Journey', desc: 'Private self-tracking with no social requirement.' },
  { key: 'friend' as const, icon: '👥', title: 'Friend Mode', desc: 'Optional sharing with trusted people only.' },
  { key: 'anonymous' as const, icon: '🌐', title: 'Anonymous Community', desc: 'Minimal identity and community support.' },
];

const features = [
  { icon: '🔒', title: 'Private by Design', desc: 'Your data stays yours. Always.' },
  { icon: '🌿', title: 'Gentle Guidance', desc: 'Small steps, meaningful progress.' },
  { icon: '💚', title: 'Zero Judgment', desc: 'Every pace is the right pace.' },
];

export default function OnboardingScreen() {
  const journeyMode = useAppStore((s) => s.journeyMode);
  const setJourneyMode = useAppStore((s) => s.setJourneyMode);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);

  const togglePrivacy = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPrivacyExpanded((v) => !v);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.headerRow}>
          <Text style={styles.headerLeaf}>🌿</Text>
          <Text style={styles.headerTitle}>The Organic Sanctuary</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(100)}>
          <GreenCard style={styles.heroCard}>
            <Text style={styles.heroTitle}>You are in a safe space.</Text>
            <Text style={styles.heroSub}>
              Your journey toward gentle wellness begins here. No pressure, no judgment — just growth.
            </Text>
          </GreenCard>
        </Animated.View>

        <View style={styles.featuresWrap}>
          {features.map((f, i) => (
            <Animated.View key={f.title} entering={FadeInUp.duration(500).delay(200 + i * 100)}>
              <Card style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.duration(500).delay(500)}>
          <Text style={styles.stepLabel}>Step 1 of 2</Text>
          <Text style={styles.sectionTitle}>Choose Your Journey</Text>

          <View style={styles.journeyWrap}>
            {journeyOptions.map((opt) => {
              const selected = journeyMode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setJourneyMode(opt.key)}
                  style={[styles.journeyCard, selected && styles.journeyCardSelected]}
                >
                  <Text style={styles.journeyIcon}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.journeyTitle}>{opt.title}</Text>
                    <Text style={styles.journeyDesc}>{opt.desc}</Text>
                  </View>
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.buttonWrap}>
          <Button title="Start My Journey" onPress={() => router.push('/account-privacy')} />
          <Button
            title="Maybe Later"
            variant="ghost"
            onPress={() => {
              setOnboardingComplete();
              router.replace('/(tabs)');
            }}
          />
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeaf: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
  },
  heroCard: {
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: fonts.headlineExtraBold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  featuresWrap: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: spacing.base,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  journeyWrap: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadow.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  journeyCardSelected: {
    borderColor: colors.primary,
  },
  journeyIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  journeyTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  journeyDesc: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkMark: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadow.card,
    marginBottom: spacing.sm,
  },
  accordionTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  accordionChevron: {
    fontSize: 12,
    color: colors.outline,
  },
  accordionBody: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  accordionText: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 21,
  },
  buttonWrap: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
