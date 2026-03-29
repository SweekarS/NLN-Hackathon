import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { GreenCard } from '../components/ui/GreenCard';
import { LightCard } from '../components/ui/LightCard';
import { Button } from '../components/ui/Button';
import { SectionTitle } from '../components/ui/SectionTitle';
import { IconCircle } from '../components/ui/IconCircle';
import { colors, fonts, spacing, radii } from '../theme';

const regionalSupport = [
  { flag: '🇺🇸', region: 'US & Canada', name: '988 Suicide & Crisis Lifeline', action: 'Call or text 988' },
  { flag: '🇬🇧', region: 'UK & EU', name: 'Samaritans', action: 'Call 116 123' },
  { flag: '🇦🇺', region: 'Australia & NZ', name: 'Lifeline', action: 'Call 13 11 14' },
];

const professionalResources = [
  'Find a Therapist',
  'Create a Safety Plan',
  'Support Groups',
];

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </Pressable>

          <Text style={styles.headline}>You are not alone.</Text>
          <Text style={styles.subtitle}>Confidential support is always within reach.</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(100)}>
          <Pressable onPress={() => Linking.openURL('tel:988')}>
            <GreenCard>
              <View style={styles.emergencyRow}>
                <Ionicons name="call" size={22} color={colors.white} />
                <Text style={styles.emergencyLabel}>Talk to someone — 988 Lifeline</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </View>
            </GreenCard>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          <Card style={styles.sectionCard}>
            <Pressable style={styles.contactRow}>
              <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
              <Text style={styles.contactLabel}>Text a Crisis Counselor</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </Card>
        </Animated.View>

        <SectionTitle title="Regional Support" />

        {regionalSupport.map((item, i) => (
          <Animated.View key={item.region} entering={FadeIn.duration(500).delay(300 + i * 80)}>
            <Card style={styles.regionalCard}>
              <View style={styles.regionalHeader}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.regionText}>{item.region}</Text>
              </View>
              <Text style={styles.regionalName}>{item.name}</Text>
              <Text style={styles.regionalAction}>{item.action}</Text>
            </Card>
          </Animated.View>
        ))}

        <Animated.View entering={FadeIn.duration(500).delay(600)}>
          <LightCard style={styles.sectionCard}>
            <Text style={styles.calmTitle}>Peace in 60 Seconds</Text>
            <Text style={styles.calmSubtitle}>Find calm in one minute</Text>
            <View style={styles.calmButtons}>
              <Button title="Breathe" variant="light" onPress={() => {}} style={styles.calmBtn} />
              <Button title="Ground" variant="light" onPress={() => {}} style={styles.calmBtn} />
            </View>
          </LightCard>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(700)}>
          <GreenCard style={styles.sectionCard}>
            <View style={styles.soundRow}>
              <Ionicons name="musical-notes" size={22} color={colors.white} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.soundTitle}>Forest Mist Soundscape</Text>
                <Text style={styles.soundSubtitle}>Immersive nature sounds for calm</Text>
              </View>
              <View style={styles.playCircle}>
                <Ionicons name="play" size={18} color={colors.primary} />
              </View>
            </View>
          </GreenCard>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(500).delay(800)}>
          <Card style={[styles.sectionCard, styles.reflectionCard]}>
            <IconCircle name="book-outline" size="lg" />
            <Text style={styles.reflectionTitle}>Write what you feel</Text>
            <Text style={styles.reflectionSubtitle}>Your thoughts are safe here.</Text>
            <Button title="Open Journal" onPress={() => {}} style={styles.journalBtn} />
          </Card>
        </Animated.View>

        <SectionTitle title="Professional Resources" />

        <Animated.View entering={FadeIn.duration(500).delay(900)}>
          <Card>
            {professionalResources.map((label, i) => (
              <Pressable
                key={label}
                style={[styles.navRow, i < professionalResources.length - 1 && styles.navRowBorder]}
              >
                <Text style={styles.navLabel}>{label}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            ))}
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
    marginBottom: spacing.lg,
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
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emergencyLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
  },
  sectionCard: {
    marginTop: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  regionalCard: {
    marginTop: spacing.sm,
  },
  regionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  flag: {
    fontSize: 20,
  },
  regionText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  regionalName: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  regionalAction: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.primary,
  },
  calmTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  calmSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  calmButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  calmBtn: {
    flex: 1,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
    marginBottom: 2,
  },
  soundSubtitle: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.primaryLight,
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflectionCard: {
    alignItems: 'center',
  },
  reflectionTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  reflectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.base,
  },
  journalBtn: {
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  navRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  navLabel: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
});
