import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

import { colors, fonts, spacing, radii, shadow, botanicalGradient } from '../theme';
import { useAppStore } from '../store/useAppStore';

type RankInfo = {
  title: string;
  levelRange: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const RANKS: RankInfo[] = [
  { title: 'Sprout', levelRange: 'Levels 1–5', desc: 'The beginning of your mindfulness journey. Planting the seeds of habit.', icon: 'leaf-outline' },
  { title: 'Sapling', levelRange: 'Levels 6–15', desc: 'Roots taking hold. Consistently showing up for yourself.', icon: 'color-wand-outline' },
  { title: 'Grove Keeper', levelRange: 'Levels 16–25', desc: 'Cultivating inner peace and nurturing your digital garden.', icon: 'rose-outline' },
  { title: 'Forest Sage', levelRange: 'Levels 26–35', desc: 'Deep wisdom from consistent, mindful rituals.', icon: 'moon-outline' },
  { title: 'Sanctuary Guardian', levelRange: 'Levels 36–45', desc: 'A protector of routine and balanced harmony.', icon: 'shield-checkmark-outline' },
  { title: 'Eternal Blossom', levelRange: 'Level 46+', desc: 'Unshakeable peace. The highest state of Phool mastery.', icon: 'flower-outline' },
];

export default function RanksModal() {
  const currentLevel = useAppStore((s) => s.level);
  const currentTitle = useAppStore((s) => s.levelTitle);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Sanctuary Ranks</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[...botanicalGradient.colors]}
              start={botanicalGradient.start}
              end={botanicalGradient.end}
              style={styles.heroIconWrap}
            >
              <Ionicons name="sparkles" size={40} color={colors.white} />
            </LinearGradient>
            <Text style={styles.heroTitle}>Your Current Rank</Text>
            <Text style={styles.heroRankText}>{currentTitle}</Text>
            <Text style={styles.heroSubText}>Level {currentLevel}</Text>
          </View>
        </Animated.View>

        <View style={styles.ranksList}>
          {RANKS.map((rank, idx) => {
            const isCurrent = rank.title === currentTitle;
            return (
              <Animated.View key={rank.title} entering={FadeInUp.delay(200 + idx * 50).duration(400)}>
                <View style={[styles.rankRow, isCurrent && styles.rankRowActive]}>
                  <View style={[styles.iconContainer, isCurrent && styles.iconContainerActive]}>
                    <Ionicons 
                      name={rank.icon} 
                      size={24} 
                      color={isCurrent ? colors.white : colors.primary} 
                    />
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankTitle, isCurrent && styles.rankTitleActive]}>
                      {rank.title}
                    </Text>
                    <Text style={styles.rankLevel}>{rank.levelRange}</Text>
                    <Text style={styles.rankDesc}>{rank.desc}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  scroll: {
    padding: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadow.card,
  },
  heroTitle: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroRankText: {
    fontSize: 32,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  heroSubText: {
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  ranksList: {
    gap: spacing.md,
  },
  rankRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rankRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLighter,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainerActive: {
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  rankTitleActive: {
    color: colors.primary,
  },
  rankLevel: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  rankDesc: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
