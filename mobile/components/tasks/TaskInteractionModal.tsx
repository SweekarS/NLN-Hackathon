import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { Task } from '../../types/task';
import { colors, fonts, spacing, radii, shadow } from '../../theme';
import { Button } from '../ui/Button';
import { ProgressRing } from '../ui/ProgressRing';
import { normalizeTask } from '../../lib/task-model';

type Props = {
  visible: boolean;
  task: Task | null;
  /** Index in the ritual list — helps infer timer/photo/check for custom task ids. */
  taskListIndex?: number;
  onClose: () => void;
  onComplete: (taskId: string) => void;
};

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TaskInteractionModal({
  visible,
  task,
  taskListIndex,
  onClose,
  onComplete,
}: Props) {
  const t = task ? normalizeTask(task, taskListIndex) : null;
  const mode = t?.interaction_type ?? 'simple_check';

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const totalSecRef = useRef(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!visible || !task) return;
    const nt = normalizeTask(task, taskListIndex);
    if (nt.interaction_type === 'timer') {
      const secs = Math.max(60, Math.round((nt.duration_minutes ?? 10) * 60));
      totalSecRef.current = secs;
      setRemaining(secs);
      setPaused(false);
    }
    setPhotoUri(null);
    setCaption('');
  }, [visible, task?.id, taskListIndex]);

  useEffect(() => {
    if (!visible || !t || t.interaction_type !== 'timer' || paused) return;
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [visible, t?.id, t?.interaction_type, paused]);

  const handleCloseRequest = useCallback(() => {
    if (!t) {
      onClose();
      return;
    }
    if (
      t.interaction_type === 'timer' &&
      remaining > 0 &&
      remaining < totalSecRef.current
    ) {
      Alert.alert(
        'Leave this Conditioning?',
        'Timer progress will be lost if you close now.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: onClose },
        ],
      );
      return;
    }
    onClose();
  }, [t, remaining, onClose]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access to attach an image.',
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!res.canceled && res.assets[0]?.uri) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const handleMarkDone = () => {
    if (!t) return;
    if (mode === 'photo_upload' && !photoUri) return;
    onComplete(t.id);
    onClose();
  };

  if (!visible || !t) return null;

  const total =
    totalSecRef.current || Math.max(60, (t.duration_minutes ?? 10) * 60);
  const timerProgress =
    mode === 'timer' && total > 0 ? 1 - remaining / total : 0;
  const canCompletePhoto = mode === 'photo_upload' && !!photoUri;
  /** Timer can be completed anytime (early exit); photo still requires an image. */
  const markDoneDisabled = mode === 'photo_upload' && !canCompletePhoto;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={handleCloseRequest}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={handleCloseRequest}
            hitSlop={12}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={28} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t.title}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {mode === 'simple_check' && (
            <View style={styles.section}>
              <Text style={styles.desc}>{t.subtitle}</Text>
              <Button
                title="Mark as Done"
                onPress={handleMarkDone}
                variant="primary"
                style={styles.cta}
              />
            </View>
          )}

          {mode === 'timer' && (
            <View style={styles.section}>
              <Text style={styles.desc}>{t.subtitle}</Text>
              <View style={styles.ringWrap}>
                <ProgressRing
                  progress={timerProgress}
                  size={200}
                  strokeWidth={14}
                  color={colors.primaryLight}
                  bgColor="rgba(9,100,68,0.12)"
                >
                  <Text style={styles.clock}>{formatClock(remaining)}</Text>
                </ProgressRing>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, timerProgress * 100)}%` },
                  ]}
                />
              </View>
              <Button
                title={paused ? 'Resume' : 'Pause'}
                onPress={() => setPaused((p) => !p)}
                variant="light"
                style={styles.cta}
              />
              <Button
                title="Mark as Done"
                onPress={handleMarkDone}
                variant="primary"
                style={styles.cta}
              />
            </View>
          )}

          {mode === 'photo_upload' && (
            <View style={styles.section}>
              <Text style={styles.desc}>{t.subtitle}</Text>
              <Pressable style={styles.photoPlaceholder} onPress={pickImage}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImg} />
                ) : (
                  <View style={styles.photoInner}>
                    <Ionicons
                      name="image-outline"
                      size={48}
                      color={colors.outline}
                    />
                    <Text style={styles.photoHint}>
                      Tap to choose from library
                    </Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.photoActions}>
                <Button
                  title="Photo library"
                  onPress={pickImage}
                  variant="light"
                  style={styles.halfBtn}
                />
                <Button
                  title="Camera"
                  onPress={takePhoto}
                  variant="ghost"
                  style={styles.halfBtn}
                />
              </View>
              <Text style={styles.captionLabel}>Add caption (optional)</Text>
              <TextInput
                style={styles.captionInput}
                value={caption}
                onChangeText={setCaption}
                placeholder="How did it go?"
                placeholderTextColor={colors.outline}
                multiline
              />
              <Button
                title="Mark as Done"
                onPress={handleMarkDone}
                variant="primary"
                disabled={markDoneDisabled}
                style={styles.cta}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceMid,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginHorizontal: spacing.sm,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  section: { gap: spacing.lg },
  desc: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  clock: {
    fontSize: 36,
    fontFamily: fonts.headlineExtraBold,
    color: colors.primary,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMid,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  cta: { marginTop: spacing.sm },
  photoPlaceholder: {
    minHeight: 200,
    borderRadius: radii.card,
    backgroundColor: colors.surfaceLow,
    overflow: 'hidden',
    ...shadow.card,
  },
  photoInner: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoImg: {
    width: '100%',
    minHeight: 220,
    resizeMode: 'cover',
  },
  photoHint: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  halfBtn: { minWidth: 140 },
  captionLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: colors.surfaceMid,
    borderRadius: radii.md,
    padding: spacing.base,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurface,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
