import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, spacing, radii, shadow } from '../theme';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showConsent, setShowConsent] = useState(false);

  const privacyPreset = useAppStore((s) => s.privacyPreset);
  const setPrivacyPreset = useAppStore((s) => s.setPrivacyPreset);
  const permissions = useAppStore((s) => s.permissions);
  const togglePermission = useAppStore((s) => s.togglePermission);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

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
              <Text style={styles.cardTitle}>Create Account</Text>
              <FieldLabel label="Full Name" />
              <FieldInput value={name} onChangeText={setName} placeholder="Your full name" />
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
                placeholder="Create a secure password"
                secureTextEntry
              />
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(200)}>
            <Button
              title="Initialize Sanctuary"
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
            title="Confirm and Enter Sanctuary"
            onPress={() => {
              setOnboardingComplete();
              router.replace('/(tabs)');
            }}
            style={styles.consentButton}
          />
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
