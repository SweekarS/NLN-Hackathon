import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { colors, fonts, spacing, botanicalGradient } from '../theme';
import { Card } from '../components/ui/Card';
import { IconCircle } from '../components/ui/IconCircle';

import { useAppStore } from '../store/useAppStore';

// We now use serverNotifications from store instead of mocks
export default function NotificationsFeedScreen() {
  const { serverNotifications, markNotificationRead } = useAppStore();

  const handlePress = async (notif: any) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
    }
    if (notif.task_id) {
      router.push('/(tabs)/tasks');
    }
  };

  const getRelativeTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    // If within 24 hours and same day, show actual time (e.g., '10:30 AM')
    if (diffHours < 24 && now.getDate() === d.getDate()) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // Otherwise show relative days
    if (diffHours < 48 && now.getDate() !== d.getDate()) {
      return 'Yesterday';
    }
    
    return `${Math.floor(Math.max(1, diffHours / 24))} days ago`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable onPress={() => router.push('/notification-settings')} hitSlop={8} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)}>
          {serverNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <IconCircle name="leaf-outline" size="lg" />
              <Text style={styles.emptyTitle}>You're all caught up!</Text>
              <Text style={styles.emptySubtitle}>No new notifications right now. Enjoy the silence.</Text>
            </View>
          ) : (
            serverNotifications.map((notif, index) => (
              <Animated.View key={notif.id} entering={FadeInUp.delay(index * 100).duration(400)}>
                <Pressable style={styles.notifCard} onPress={() => handlePress(notif)}>
                  <View style={styles.iconContainer}>
                    <IconCircle name={(notif.icon as any) || 'notifications-outline'} size="sm" />
                    {!notif.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.title, !notif.is_read && styles.unreadText]}>{notif.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{notif.message}</Text>
                    <Text style={styles.time}>{getRelativeTime(notif.created_at)}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLow,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: spacing.md,
  },
  iconContainer: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  unreadText: {
    fontFamily: fonts.headlineExtraBold,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.outline,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
