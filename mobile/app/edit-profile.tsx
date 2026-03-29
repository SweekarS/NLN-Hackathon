import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../lib/supabase';
import {
  colors,
  fonts,
  spacing,
  radii,
  shadow,
  botanicalGradient,
} from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { FieldInput } from '../components/ui/FieldInput';
import { FieldLabel } from '../components/ui/FieldLabel';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    userName: storeUserName,
    avatarImage: storeAvatarImage,
    setUserName,
    setAvatarImage,
  } = useAppStore();

  const [name, setName] = useState(storeUserName);
  const [localAvatar, setLocalAvatar] = useState<string | null>(
    storeAvatarImage,
  );
  const [saving, setSaving] = useState(false);

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission needed',
        'Please grant photo gallery access to choose an avatar.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLocalAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Your name cannot be empty.');
      return;
    }

    setSaving(true);
    let finalAvatarUrl = storeAvatarImage;

    try {
      // 1. Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to update your profile.');
      }

      // 2. Upload new image if changed
      if (localAvatar && localAvatar !== storeAvatarImage) {
        const ext =
          localAvatar.split('.').pop()?.toLowerCase() === 'png'
            ? 'png'
            : 'jpeg';
        const path = `${user.id}/${Date.now()}.${ext}`;

        const formData = new FormData();
        formData.append('file', {
          uri: localAvatar,
          type: `image/${ext}`,
          name: `avatar.${ext}`,
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, formData);

        if (uploadError) {
          throw new Error('Failed to upload image: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        finalAvatarUrl = publicUrlData.publicUrl;
      }

      // 3. Update database
      let { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: trimmed, avatar_url: finalAvatarUrl })
        .eq('id', user.id);

      // Fallback if avatar_url column does not exist
      if (dbError && dbError.message.includes('avatar_url')) {
        const fallback = await supabase
          .from('profiles')
          .update({ full_name: trimmed })
          .eq('id', user.id);
        dbError = fallback.error;
      }

      if (dbError) {
        throw new Error('Failed to update database: ' + dbError.message);
      }

      // 4. Update auth metadata just in case
      await supabase.auth.updateUser({
        data: { full_name: trimmed, avatar_url: finalAvatarUrl },
      });

      // 5. Update global store
      setUserName(trimmed);
      setAvatarImage(finalAvatarUrl);
      router.back();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e.message || 'Something went wrong saving your profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.onSurface}
              />
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable style={styles.avatarWrap} onPress={handlePickImage}>
              {localAvatar ? (
                <Image
                  source={{ uri: localAvatar }}
                  style={[styles.avatarBig, { resizeMode: 'cover' }]}
                />
              ) : (
                <LinearGradient
                  colors={[...botanicalGradient.colors]}
                  start={botanicalGradient.start}
                  end={botanicalGradient.end}
                  style={styles.avatarBig}
                >
                  <Ionicons name="person" size={50} color={colors.white} />
                </LinearGradient>
              )}

              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </View>
            </Pressable>

            <Text style={styles.helperText}>Tap to change photo</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={{ marginBottom: spacing.xl }}>
              <FieldLabel label="Display Name" />
              <FieldInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.buttonWrap}>
              <Button
                title={saving ? 'Saving...' : 'Save Changes'}
                onPress={handleSave}
                disabled={saving}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: 60,
  },
  backLabel: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatarBig: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  helperText: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  formSection: {
    flex: 1,
  },
  buttonWrap: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
