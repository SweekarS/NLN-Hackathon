import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { BottomSheet } from '../components/ui/BottomSheet';
import { FieldLabel } from '../components/ui/FieldLabel';
import { FieldInput } from '../components/ui/FieldInput';
import type { User } from '@supabase/supabase-js';
import { useAppStore } from '../store/useAppStore';
import { signInWithGoogle } from '../lib/auth-google';
import { isSupabaseConfigured, supabase, supabaseDashboardAuthUrl } from '../lib/supabase';
import { colors, fonts, spacing, radii } from '../theme';

/** Supabase enforces limits per IP and per project; a new email does not bypass them. */
function isAuthRateLimitError(error: { message?: string; code?: string }): boolean {
  const code = error.code ?? '';
  const raw = (error.message ?? '').toLowerCase();
  return (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    code === 'over_sms_send_rate_limit' ||
    /rate\s*limit|too many requests/i.test(raw)
  );
}

function alertAuthRateLimit() {
  const providersUrl = supabaseDashboardAuthUrl('providers');
  const rateLimitsUrl = supabaseDashboardAuthUrl('rate-limits');
  const body =
    'Supabase is temporarily blocking more signups from this network or project. Using another email usually does not help.\n\n' +
    'To keep testing: in the Supabase dashboard open Authentication → Providers → Email and turn off Confirm email (dev only). ' +
    'That stops confirmation emails, which avoids the strict built-in email cap.\n\n' +
    'You can also review Authentication → Rate Limits. Wait a few minutes and try again.';

  const buttons: {
    text: string;
    style?: 'cancel' | 'default' | 'destructive';
    onPress?: () => void;
  }[] = [{ text: 'OK', style: 'cancel' }];

  if (providersUrl) {
    buttons.unshift({
      text: 'Email settings',
      onPress: () => {
        void Linking.openURL(providersUrl);
      },
    });
  }
  if (rateLimitsUrl) {
    buttons.unshift({
      text: 'Rate limits',
      onPress: () => {
        void Linking.openURL(rateLimitsUrl);
      },
    });
  }

  Alert.alert('Signup limit reached', body, buttons);
}

const privacyPresets = [
  { key: 'only_me' as const, icon: '🔒', title: 'Only Me', desc: 'Maximum privacy — data stays on device.' },
  { key: 'circles' as const, icon: '👥', title: 'Sanctuary Circles', desc: 'Share selectively with trusted circles.' },
  { key: 'global' as const, icon: '🌐', title: 'Global Reach', desc: 'Contribute anonymously to community insights.' },
];

const permissionRows = [
  { key: 'vitals' as const, icon: '💓', title: 'Vital Metrics', desc: 'Heart rate, sleep, activity data' },
  { key: 'location' as const, icon: '📍', title: 'Environment Awareness', desc: 'Location-based wellness cues' },
];

export default function AccountPrivacyScreen() {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const privacyPreset = useAppStore((s) => s.privacyPreset);
  const setPrivacyPreset = useAppStore((s) => s.setPrivacyPreset);
  const permissions = useAppStore((s) => s.permissions);
  const togglePermission = useAppStore((s) => s.togglePermission);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const setUserName = useAppStore((s) => s.setUserName);

  const persistProfileAndEnter = async (user: User, displayName: string) => {
    setUserName(displayName);
    setOnboardingComplete();
    const { stressMode, notificationsEnabled, theme } = useAppStore.getState();
    await supabase
      .from('users')
      .update({
        name: displayName,
        visibility: privacyPreset,
        stress_mode: stressMode,
        notifications_enabled: notificationsEnabled,
        theme,
        language: 'en',
      })
      .eq('id', user.id);
    setShowConsent(false);
    router.replace('/(tabs)');
  };

  const handleGoogleAuth = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to mobile/.env, then restart Expo with: npx expo start -c'
      );
      return;
    }
    setAuthLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Google sign-in failed', error.message);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const meta = session.user.user_metadata as Record<string, string | undefined>;
      const displayName =
        meta.full_name ||
        meta.name ||
        (session.user.email ? session.user.email.split('@')[0] : '') ||
        'Friend';
      await persistProfileAndEnter(session.user, displayName);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const confirmAndEnterSanctuary = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (authMode === 'signup' && !trimmedName) {
      Alert.alert('Missing name', 'Please enter your full name to create an account.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Supabase not configured',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to mobile/.env, then restart Expo with: npx expo start -c'
      );
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          if (isAuthRateLimitError(error)) {
            alertAuthRateLimit();
            return;
          }
          const msg = error.message ?? '';
          if (/invalid login|invalid credentials|email not confirmed/i.test(msg)) {
            Alert.alert(
              'Sign in failed',
              'Check your email and password. If you just signed up, confirm your email or use Google, or ask your project admin to disable email confirmation for testing.'
            );
            return;
          }
          const looksLikeNetwork =
            msg.includes('Network request failed') ||
            msg.includes('Failed to fetch') ||
            msg.includes('network');
          Alert.alert(
            looksLikeNetwork ? 'Can’t reach Supabase' : 'Could not sign in',
            looksLikeNetwork
              ? 'Check Wi‑Fi or cellular and try without VPN. In mobile/.env set EXPO_PUBLIC_SUPABASE_URL to your project API URL (starts with https) and EXPO_PUBLIC_SUPABASE_ANON_KEY to the anon key—no spaces or quotes. Confirm the project is active in Supabase, save, then run npx expo start -c.'
              : msg
          );
          return;
        }

        if (data.user) {
          const displayName = trimmedName || (trimmedEmail ? trimmedEmail.split('@')[0] : 'Friend');
          await persistProfileAndEnter(data.user, displayName);
        }
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
          },
        },
      });

      if (error) {
        if (isAuthRateLimitError(error)) {
          alertAuthRateLimit();
          return;
        }
        const msg = error.message ?? '';
        const looksLikeNetwork =
          msg.includes('Network request failed') ||
          msg.includes('Failed to fetch') ||
          msg.includes('network');
        Alert.alert(
          looksLikeNetwork ? 'Can’t reach Supabase' : 'Could not create account',
          looksLikeNetwork
            ? 'Check Wi‑Fi or cellular and try without VPN. In mobile/.env set EXPO_PUBLIC_SUPABASE_URL to your project API URL (starts with https) and EXPO_PUBLIC_SUPABASE_ANON_KEY to the anon key—no spaces or quotes. Confirm the project is active in Supabase, save, then run npx expo start -c.'
            : msg
        );
        return;
      }

      if (data.session?.user) {
        await persistProfileAndEnter(data.session.user, trimmedName);
      } else {
        Alert.alert(
          'Confirm your email',
          'We sent a confirmation link. Open it, then return here and use Sign in (or Google).'
        );
        setShowConsent(false);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      const looksLikeNetwork =
        msg.includes('Network request failed') ||
        msg.includes('Failed to fetch') ||
        msg.includes('network');
      Alert.alert(
        looksLikeNetwork ? 'Can’t reach Supabase' : 'Error',
        looksLikeNetwork
          ? 'Network error reaching Supabase. Check connection, mobile/.env URL and anon key (no spaces), then npx expo start -c.'
          : msg
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTogglePermission = async (key: 'vitals' | 'mindfulness' | 'location') => {
    const isCurrentlyOn = permissions[key];

    // If turning off, just turn it off immediately
    if (isCurrentlyOn) {
      togglePermission(key);
      return;
    }

    // If turning on, we request the native device permission first
    try {
      if (key === 'location') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          togglePermission(key);
        } else {
          Alert.alert('Permission Denied', 'Location permission is required for this feature.');
        }
      } else if (key === 'vitals') {
        const isAvailable = await Pedometer.isAvailableAsync();
        
        if (!isAvailable) {
           Alert.alert('Sensor Not Available', 'Motion tracking is not available on this simulator/device. Simulating successful permission grant for testing.');
           togglePermission(key);
           return;
        }

        const { status } = await Pedometer.requestPermissionsAsync();
        if (status === 'granted') {
          togglePermission(key);
        } else {
          Alert.alert('Permission Denied', 'Motion data permission is required for Vital Metrics.');
        }
      } else {
        // Mindfulness or any other permission that doesn't need system APIs
        togglePermission(key);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', String(error) || 'An error occurred while requesting permission.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotFilled]} />
            <View style={[styles.dot, styles.dotFilled]} />
            <View style={[styles.dot, styles.dotOutline]} />
          </Animated.View>

          <Text style={styles.stepLabel}>Step 2 of 2</Text>

          <Animated.View entering={FadeInUp.duration(600).delay(100)}>
            <Card style={styles.formCard}>
              <Text style={styles.cardTitle}>Account</Text>
              <View style={styles.authModeRow}>
                <Pressable
                  onPress={() => setAuthMode('signup')}
                  style={[styles.authModeChip, authMode === 'signup' && styles.authModeChipActive]}
                >
                  <Text style={[styles.authModeText, authMode === 'signup' && styles.authModeTextActive]}>
                    Sign up
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAuthMode('signin')}
                  style={[styles.authModeChip, authMode === 'signin' && styles.authModeChipActive]}
                >
                  <Text style={[styles.authModeText, authMode === 'signin' && styles.authModeTextActive]}>
                    Sign in
                  </Text>
                </Pressable>
              </View>
              {authMode === 'signup' && (
                <>
                  <FieldLabel label="Full Name" />
                  <FieldInput value={name} onChangeText={setName} placeholder="Your full name" />
                </>
              )}
              <FieldLabel label="Email" />
              <FieldInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <FieldLabel label="Password" />
              <FieldInput
                value={password}
                onChangeText={setPassword}
                placeholder={authMode === 'signup' ? 'Create a secure password' : 'Your password'}
                secureTextEntry
              />
              <Pressable
                onPress={() => void handleGoogleAuth()}
                disabled={authLoading}
                style={({ pressed }) => [
                  styles.googleButton,
                  { opacity: authLoading ? 0.55 : pressed ? 0.9 : 1 },
                ]}
              >
                <Ionicons name="logo-google" size={22} color={colors.onSurface} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </Pressable>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(200)}>
            <Button
              title={authMode === 'signup' ? 'Continue with email' : 'Sign in with email'}
              onPress={() => setShowConsent(true)}
              style={styles.initButton}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(400)}>
            <Card>
              <Text style={styles.cardTitle}>Privacy Presets</Text>
              <View style={styles.presetsWrap}>
                {privacyPresets.map((p) => {
                  const selected = privacyPreset === p.key;
                  return (
                    <Pressable
                      key={p.key}
                      onPress={() => setPrivacyPreset(p.key)}
                      style={[styles.presetOption, selected && styles.presetSelected]}
                    >
                      <Text style={styles.presetIcon}>{p.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.presetTitle}>{p.title}</Text>
                        <Text style={styles.presetDesc}>{p.desc}</Text>
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
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(500)}>
            <Card style={styles.permissionsCard}>
              <Text style={styles.cardTitle}>Detailed Permissions</Text>
              {permissionRows.map((row, i) => (
                <View
                  key={row.key}
                  style={[styles.permRow, i < permissionRows.length - 1 && styles.permRowBorder]}
                >
                  <Text style={styles.permIcon}>{row.icon}</Text>
                  <View style={styles.permText}>
                    <Text style={styles.permTitle}>{row.title}</Text>
                    <Text style={styles.permDesc}>{row.desc}</Text>
                  </View>
                  <Toggle value={permissions[row.key]} onToggle={() => handleTogglePermission(row.key)} />
                </View>
              ))}
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet visible={showConsent} onClose={() => setShowConsent(false)}>
        <View style={styles.consentContent}>
          <Ionicons name="shield-checkmark" size={48} color={colors.primary} style={styles.consentIcon} />
          <Text style={styles.consentTitle}>Confirm Your Sovereignty</Text>
          <Text style={styles.consentBody}>
            Your sanctuary data is protected by end-to-end privacy. Nothing leaves your device without
            your explicit consent.
          </Text>
          <Button
            title={
              authLoading
                ? authMode === 'signin'
                  ? 'Signing in…'
                  : 'Creating account…'
                : authMode === 'signin'
                  ? 'Sign in and enter sanctuary'
                  : 'Create account and enter sanctuary'
            }
            onPress={() => void confirmAndEnterSanctuary()}
            style={styles.consentButton}
            disabled={authLoading}
          />
          {authLoading && (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginBottom: spacing.md }}
              accessibilityLabel={authMode === 'signin' ? 'Signing in' : 'Creating account'}
            />
          )}
          <Button
            title="Review Full Ethics Charter"
            variant="ghost"
            onPress={() => setShowConsent(false)}
          />
        </View>
      </BottomSheet>
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotOutline: {
    borderWidth: 2,
    borderColor: colors.outline,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.base,
  },
  formCard: {
    marginBottom: spacing.base,
  },
  authModeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  authModeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
  },
  authModeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLighter,
  },
  authModeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onSurfaceVariant,
  },
  authModeTextActive: {
    color: colors.primary,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  googleIcon: {
    marginRight: spacing.sm,
  },
  googleButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  initButton: {
    marginBottom: spacing.xl,
  },
  dataRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  dataCard: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
  },
  dataCardInner: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  dataCardLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  presetsWrap: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.input,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLighter,
  },
  presetIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  presetTitle: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  presetDesc: {
    fontSize: 12,
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
  permissionsCard: {
    marginTop: spacing.base,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  permRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  permIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  permText: {
    flex: 1,
  },
  permTitle: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  permDesc: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  consentContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  consentIcon: {
    marginBottom: spacing.base,
  },
  consentTitle: {
    fontSize: 22,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  consentBody: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  consentButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
});
