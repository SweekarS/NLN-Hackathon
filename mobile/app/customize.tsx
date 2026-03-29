import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

import { colors, fonts, spacing, radii, shadow } from '../theme';
import { useAppStore, type Task } from '../store/useAppStore';
import type { InteractionType } from '../types/task';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { SectionTitle } from '../components/ui/SectionTitle';
import { SelectorPill } from '../components/ui/SelectorPill';
import { FieldInput } from '../components/ui/FieldInput';
import { FieldLabel } from '../components/ui/FieldLabel';
import { IconCircle } from '../components/ui/IconCircle';
import { isSupabaseConfigured } from '../lib/supabase';

type TimeOfDay = Task['timeOfDay'];

const TIME_BADGE_COLORS: Record<TimeOfDay, string> = {
  morning: '#FFF3E0',
  afternoon: '#E8F7EF',
  evening: '#EDE7F6',
};

const INTERACTION_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: 'timer', label: 'Timer' },
  { value: 'photo_upload', label: 'Photo' },
  { value: 'simple_check', label: 'Quick check' },
];

export default function CustomizeScreen() {
  const insets = useSafeAreaInsets();
  const {
    tasks,
    toggleTaskEnabled,
    addTask,
    updateTask,
    deleteTask,
    persistTasksToProfile,
  } = useAppStore();

  const [taskName, setTaskName] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>('morning');
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editTimeOfDay, setEditTimeOfDay] = useState<TimeOfDay>('morning');
  const [editInteraction, setEditInteraction] = useState<InteractionType>('simple_check');
  const [editMinutes, setEditMinutes] = useState('');

  const usedSlots = tasks.length;
  const totalSlots = 7;

  const openEdit = useCallback((t: Task) => {
    setEditId(t.id);
    setEditTitle(t.title);
    setEditSubtitle(t.subtitle);
    setEditTimeOfDay(t.timeOfDay);
    setEditInteraction(t.interaction_type ?? 'simple_check');
    setEditMinutes(
      t.interaction_type === 'timer' && t.duration_minutes != null
        ? String(t.duration_minutes)
        : ''
    );
    setEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setEditId(null);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editId || !editTitle.trim()) return;
    const prev = useAppStore.getState().tasks.find((x) => x.id === editId);
    if (!prev) return;
    let duration_minutes: number | undefined;
    if (editInteraction === 'timer') {
      const n = parseFloat(editMinutes.replace(/,/g, '.'));
      duration_minutes = Number.isFinite(n) ? Math.round(n) : 5;
    }
    /** Manual edits keep the exact minutes typed (no Gemini-style clamping). */
    updateTask(editId, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || ' ',
      timeOfDay: editTimeOfDay,
      interaction_type: editInteraction,
      duration_minutes,
    });
    closeEdit();
  }, [
    editId,
    editTitle,
    editSubtitle,
    editTimeOfDay,
    editInteraction,
    editMinutes,
    updateTask,
    closeEdit,
  ]);

  const confirmDelete = useCallback(
    (t: Task) => {
      if (tasks.length <= 1) {
        Alert.alert('Keep one ritual', 'You need at least one task in your ritual list.');
        return;
      }
      Alert.alert(
        'Remove ritual',
        `Remove “${t.title}”? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTask(t.id),
          },
        ]
      );
    },
    [tasks.length, deleteTask]
  );

  const handleAdd = () => {
    if (!taskName.trim()) return;
    addTask({
      id: Date.now().toString(),
      icon: 'leaf-outline',
      icon_type: 'leaf',
      title: taskName.trim(),
      subtitle: 'Custom ritual',
      timeOfDay: selectedTime,
      enabled: true,
      interaction_type: 'simple_check',
    });
    setTaskName('');
  };

  const handleSaveRoutine = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        await persistTasksToProfile();
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeIn.duration(400)}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Structure Your Day</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Text style={styles.headline}>
              Craft your daily{' '}
              <Text style={styles.headlineAccent}>rhythm.</Text>
            </Text>
            <Text style={styles.subtitleText}>
              Edit or remove rituals, or add new ones. Changes sync when you save.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Card style={styles.ritualCard}>
              <View style={styles.ritualHeader}>
                <Text style={styles.ritualTitle}>Add a Ritual</Text>
                <Text style={styles.slotsLabel}>
                  {Math.min(usedSlots, totalSlots)} of {totalSlots} slots used
                </Text>
              </View>

              <View style={styles.dotsRow}>
                {Array.from({ length: totalSlots }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          i < usedSlots ? colors.primary : colors.surfaceMid,
                      },
                    ]}
                  />
                ))}
              </View>

              <FieldLabel label="Ritual Name" />
              <FieldInput
                value={taskName}
                onChangeText={setTaskName}
                placeholder="e.g. Sunset walk"
              />

              <FieldLabel label="Daily Schedule" />
              <View style={styles.pillRow}>
                <SelectorPill
                  label="Morning"
                  iconName="sunny-outline"
                  selected={selectedTime === 'morning'}
                  onPress={() => setSelectedTime('morning')}
                />
                <SelectorPill
                  label="Afternoon"
                  iconName="partly-sunny-outline"
                  selected={selectedTime === 'afternoon'}
                  onPress={() => setSelectedTime('afternoon')}
                />
                <SelectorPill
                  label="Evening"
                  iconName="moon-outline"
                  selected={selectedTime === 'evening'}
                  onPress={() => setSelectedTime('evening')}
                />
              </View>

              <Button
                title="Add to AuraFarm"
                onPress={handleAdd}
                variant="primary"
                style={styles.addBtn}
                disabled={!taskName.trim() || usedSlots >= totalSlots}
              />
            </Card>
          </Animated.View>

          <SectionTitle title="Your rituals" />

          {tasks.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(400 + idx * 50).duration(400)}
            >
              <Card style={styles.taskRow}>
                <View style={styles.taskRowTop}>
                  <View style={styles.taskRowLeft}>
                    <IconCircle
                      name={(item.icon || 'leaf-outline') as keyof typeof Ionicons.glyphMap}
                      size="md"
                    />
                    <View style={styles.taskRowText}>
                      <Text style={styles.taskRowTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.taskRowSub} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                      <View
                        style={[
                          styles.timeBadge,
                          { backgroundColor: TIME_BADGE_COLORS[item.timeOfDay] },
                        ]}
                      >
                        <Text style={styles.timeBadgeText}>
                          {item.timeOfDay.toUpperCase()}
                          {item.interaction_type === 'timer' && item.duration_minutes
                            ? ` · ${item.duration_minutes} min`
                            : ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Toggle
                    value={item.enabled !== false}
                    onToggle={() => toggleTaskEnabled(item.id)}
                  />
                </View>
                <View style={styles.taskActions}>
                  <Pressable
                    onPress={() => openEdit(item)}
                    style={styles.actionBtn}
                    hitSlop={8}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(item)}
                    style={styles.actionBtn}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.actionBtnText, styles.deleteText]}>Delete</Text>
                  </Pressable>
                </View>
              </Card>
            </Animated.View>
          ))}

          <Animated.View
            entering={FadeInUp.delay(650).duration(500)}
            style={styles.bottomActions}
          >
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="ghost"
              style={styles.bottomBtn}
              disabled={saving}
            />
            <Button
              title={saving ? 'Saving…' : 'Save routine'}
              onPress={handleSaveRoutine}
              variant="primary"
              style={styles.bottomBtn}
              disabled={saving}
            />
          </Animated.View>

          <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={editOpen} animationType="slide" transparent onRequestClose={closeEdit}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <View style={styles.modalOuter}>
            <Pressable style={styles.modalBackdrop} onPress={closeEdit} accessibilityRole="button" />
            <View
              style={[
                styles.modalSheet,
                { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Text style={styles.modalTitle}>Edit ritual</Text>
                <FieldLabel label="Title" />
                <FieldInput value={editTitle} onChangeText={setEditTitle} placeholder="Title" />
                <FieldLabel label="Description" />
                <FieldInput
                  value={editSubtitle}
                  onChangeText={setEditSubtitle}
                  placeholder="Short description"
                  multiline
                />
                <FieldLabel label="Time of day" />
                <View style={styles.pillRow}>
                  <SelectorPill
                    label="Morning"
                    iconName="sunny-outline"
                    selected={editTimeOfDay === 'morning'}
                    onPress={() => setEditTimeOfDay('morning')}
                  />
                  <SelectorPill
                    label="Afternoon"
                    iconName="partly-sunny-outline"
                    selected={editTimeOfDay === 'afternoon'}
                    onPress={() => setEditTimeOfDay('afternoon')}
                  />
                  <SelectorPill
                    label="Evening"
                    iconName="moon-outline"
                    selected={editTimeOfDay === 'evening'}
                    onPress={() => setEditTimeOfDay('evening')}
                  />
                </View>
                <FieldLabel label="Completion type" />
                <View style={styles.pillRowWrap}>
                  {INTERACTION_OPTIONS.map((opt) => (
                    <SelectorPill
                      key={opt.value}
                      label={opt.label}
                      iconName={
                        opt.value === 'timer'
                          ? 'timer-outline'
                          : opt.value === 'photo_upload'
                            ? 'camera-outline'
                            : 'checkmark-circle-outline'
                      }
                      selected={editInteraction === opt.value}
                      onPress={() => setEditInteraction(opt.value)}
                    />
                  ))}
                </View>
                {editInteraction === 'timer' ? (
                  <>
                    <FieldLabel label="Duration (minutes)" />
                    <FieldInput
                      value={editMinutes}
                      onChangeText={setEditMinutes}
                      placeholder="e.g. 5"
                      keyboardType="number-pad"
                    />
                  </>
                ) : null}
                <View style={styles.modalActions}>
                  <Button title="Cancel" onPress={closeEdit} variant="ghost" style={styles.modalBtn} />
                  <Button
                    title="Apply"
                    onPress={commitEdit}
                    variant="primary"
                    style={styles.modalBtn}
                    disabled={!editTitle.trim()}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {saving ? (
        <View style={styles.savingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLighter,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  headline: {
    fontSize: 30,
    fontFamily: fonts.headlineExtraBold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  headlineAccent: {
    fontStyle: 'italic',
    color: colors.primary,
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  ritualCard: {
    marginBottom: spacing.sm,
  },
  ritualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ritualTitle: {
    fontSize: 17,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  slotsLabel: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: colors.outline,
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  pillRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  addBtn: {
    marginTop: spacing.lg,
  },
  taskRow: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  taskRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  taskRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  taskRowText: {
    flex: 1,
    gap: 4,
  },
  taskRowTitle: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
  },
  taskRowSub: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  timeBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: 4,
  },
  timeBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  taskActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingLeft: 48,
    paddingTop: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  deleteText: {
    color: colors.error,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  bottomBtn: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
  },
  modalOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    zIndex: 1,
    maxHeight: '92%',
    width: '100%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.card,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalBtn: {
    flex: 1,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
