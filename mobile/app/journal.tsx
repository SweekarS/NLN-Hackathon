import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../theme';
import { useAppStore } from '../store/useAppStore';
import {
  saveJournalEntryRemote,
  fetchJournalEntriesRemote,
  type JournalEntry,
} from '../lib/sync-dashboard-stats';
import { getLogicalDateString } from '../lib/logical-date';
import { Button } from '../components/ui/Button';

type Tab = 'write' | 'past';

export default function JournalScreen() {
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [todayEntryExists, setTodayEntryExists] = useState(false);
  const { lastLogicalDateKey } = useAppStore();

  const today = lastLogicalDateKey || getLogicalDateString();

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'write') {
        checkTodayEntry();
      } else if (activeTab === 'past') {
        loadPastEntries();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]),
  );

  const checkTodayEntry = async () => {
    try {
      const result = await fetchJournalEntriesRemote();
      if (!result.error && result.data.length > 0) {
        // Find today's entry
        const found = result.data.find((entry) => entry.log_date === today);
        if (found) {
          setTodayEntryExists(true);
        } else {
          setTodayEntryExists(false);
        }
        setPastEntries(result.data);
      }
    } catch (err) {
      console.error('Error checking today entry:', err);
    }
  };

  const loadPastEntries = async () => {
    setLoadingEntries(true);
    try {
      const result = await fetchJournalEntriesRemote();
      if (result.error) {
        console.error('Failed to load entries:', result.error);
      } else {
        setPastEntries(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleSave = async () => {
    if (!reflection.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setLoading(true);
    try {
      const result = await saveJournalEntryRemote(
        reflection,
        lastLogicalDateKey,
      );
      if (result.error) {
        console.error('Save error:', result.error.message);
        Alert.alert(
          'Error',
          result.error.message ||
            'Failed to save journal entry. Please try again.',
        );
      } else {
        Alert.alert('Success', 'Your reflection has been saved.');
        setReflection('');
        // Mark that today's entry exists
        setTodayEntryExists(true);
        // Refresh past entries
        loadPastEntries();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Journal</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'write' && styles.tabActive]}
          onPress={() => setActiveTab('write')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'write' && styles.tabLabelActive,
            ]}
          >
            Write
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'past' && styles.tabLabelActive,
            ]}
          >
            Past Entries
          </Text>
        </Pressable>
      </View>

      {/* Write Tab */}
      {activeTab === 'write' && todayEntryExists ? (
        <View style={styles.alreadyWrittenContainer}>
          <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
          <Text style={styles.alreadyWrittenTitle}>Already written today</Text>
          <Text style={styles.alreadyWrittenText}>
            You can only write one journal entry per day. Your reflection for
            today has been saved.
          </Text>
        </View>
      ) : activeTab === 'write' ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.label}>
            Write your thoughts, feelings, and insights for today
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Share what's on your mind..."
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            value={reflection}
            onChangeText={setReflection}
            editable={!loading}
          />

          <Text style={styles.charCount}>{reflection.length} characters</Text>

          <Button
            title={loading ? 'Saving...' : 'Save Reflection'}
            onPress={handleSave}
            variant="primary"
            style={{ marginTop: spacing.xl }}
            disabled={loading}
          />
        </ScrollView>
      ) : null}

      {/* Past Entries Tab */}
      {activeTab === 'past' && (
        <>
          {loadingEntries ? (
            <View style={styles.centerLoader}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : pastEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={48}
                color={colors.onSurfaceVariant}
              />
              <Text style={styles.emptyText}>No past entries yet</Text>
              <Text style={styles.emptySubtext}>
                Start writing to build your journal
              </Text>
            </View>
          ) : (
            <FlatList
              data={pastEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.entryCard}>
                  <Text style={styles.entryDate}>
                    {formatDate(item.log_date)}
                  </Text>
                  <Text style={styles.entryContent} numberOfLines={3}>
                    {item.content}
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.entriesList}
              scrollEnabled
            />
          )}
        </>
      )}
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
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHigh,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceHigh,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    padding: spacing.lg,
    minHeight: 300,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurface,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginTop: spacing.base,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  entriesList: {
    padding: spacing.lg,
    gap: spacing.base,
  },
  entryCard: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  entryDate: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  entryContent: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurface,
    lineHeight: 20,
  },
  alreadyWrittenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  alreadyWrittenTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  alreadyWrittenText: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
