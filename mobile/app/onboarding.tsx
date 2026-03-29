import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { GreenCard } from '../components/ui/GreenCard';
import { Button } from '../components/ui/Button';
import { FieldInput } from '../components/ui/FieldInput';
import { FieldLabel } from '../components/ui/FieldLabel';
import { Logo } from '../components/ui/Logo';
import { useAppStore } from '../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { IconCircle } from '../components/ui/IconCircle';
import { colors, fonts, spacing, radii, shadow } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const journeyOptions = [
  { key: 'solo' as const, iconName: 'body-outline' as const, title: 'Solo Journey', desc: 'Private self-tracking with no social requirement.' },
  { key: 'friend' as const, iconName: 'people-outline' as const, title: 'Friend Mode', desc: 'Optional sharing with trusted people only.' },
  { key: 'anonymous' as const, iconName: 'globe-outline' as const, title: 'Anonymous Community', desc: 'Minimal identity and community support.' },
];

const features = [
  { iconName: 'lock-closed-outline' as const, title: 'Private by Design', desc: 'Your data stays yours. Always.' },
  { iconName: 'leaf-outline' as const, title: 'Gentle Guidance', desc: 'Small steps, meaningful progress.' },
  { iconName: 'heart-outline' as const, title: 'Zero Judgment', desc: 'Every pace is the right pace.' },
];

export default function OnboardingScreen() {
  const journeyMode = useAppStore((s) => s.journeyMode);
  const setJourneyMode = useAppStore((s) => s.setJourneyMode);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [step, setStep] = useState<'intro' | 'journey' | 'login'>('intro');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const togglePrivacy = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPrivacyExpanded((v) => !v);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 'intro' && (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Animated.View entering={FadeInUp.duration(600).delay(50)}>
                <Logo size={160} />
              </Animated.View>

              <Animated.View entering={FadeInUp.duration(700).delay(150)}>
                <Text style={{
                  marginTop: spacing['2xl'],
                  fontSize: 24,
                  fontFamily: fonts.headlineExtraBold,
                  color: colors.primary,
                  textAlign: 'center',
                  paddingHorizontal: spacing.lg,
                  lineHeight: 32
                }}>
                  The Organic Sanctuary
                </Text>
              </Animated.View>
            </View>

            <View style={[styles.buttonWrap, { marginTop: 'auto', paddingTop: spacing.xl }]}>
              <Button title="Sign Up" onPress={() => setStep('journey')} />
              <Button title="Sign In" variant="ghost" onPress={() => setStep('login')} />
            </View>
          </Animated.View>
        )}

        {step === 'journey' && (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)}>
            <Animated.View entering={FadeInUp.duration(500).delay(100)}>
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
                      <IconCircle name={opt.iconName} size="md" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.journeyTitle}>{opt.title}</Text>
                        <Text style={styles.journeyDesc}>{opt.desc}</Text>
                      </View>
                      {selected && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={14} color={colors.white} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            <View style={styles.buttonWrap}>
              <Button title="Start My Journey" onPress={() => router.push('/account-privacy')} />
              <Button title="Back" variant="ghost" onPress={() => setStep('intro')} />
            </View>
          </Animated.View>
        )}

        {step === 'login' && (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)}>
            <Animated.View entering={FadeInUp.duration(500).delay(100)}>
              <Text style={styles.sectionTitle}>Welcome Back</Text>

              <View style={[styles.featuresWrap, { marginTop: spacing.xl }]}>
                <View style={{ marginBottom: spacing.md }}>
                  <FieldLabel label="Email" />
                  <FieldInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ marginBottom: spacing.md }}>
                  <FieldLabel label="Password" />
                  <FieldInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                  />
                </View>
              </View>
            </Animated.View>

            <View style={styles.buttonWrap}>
              <Button title="Login" onPress={() => router.replace('/(tabs)')} />
              <Button title="Back" variant="ghost" onPress={() => setStep('intro')} />
            </View>
          </Animated.View>
        )}
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
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
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
    gap: spacing.base,
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
    gap: spacing.md,
  },
  journeyCardSelected: {
    borderColor: colors.primary,
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
  buttonWrap: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
