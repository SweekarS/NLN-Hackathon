import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLogicalDateString, getLogicalDateRange } from '../lib/logical-date';
import {
  type DailyLogFlags,
  XP_PER_TASK,
  XP_BONUS_ALL_FOUR,
  getLevelFromTotalXP,
  getGrowthTierTitle,
  flagsFromTaskIds,
  completionIdsFromFlags,
  countTasksDone,
  computeCurrentStreak,
  computeWeeklyActiveDays,
  computeLongestStreakEndDate,
  resolveLogFlagKey,
} from '../lib/dashboard-stats';
import {
  fetchDashboardSnapshot,
  upsertDailyLogRemote,
  updateProfileStatsRemote,
  saveOnboardingCompleteToProfile,
  parseTasksFromProfileJson,
  inferHasCompletedOnboarding,
  fetchRemoteNotifications,
  markNotificationReadRemote,
  type RemoteNotification,
} from '../lib/sync-dashboard-stats';
import type { Task, CustomTask, InteractionType } from '../types/task';
import {
  normalizeTask,
  formatDurationMinutesLabel,
  applySensibleTimerDurations,
} from '../lib/task-model';
import { extractJsonArray } from '../lib/gemini-json';
import { scheduleDailyReminders } from '../lib/notifications';
import {
  scheduleProfileTasksJsonSync,
  flushProfileTasksJsonSync,
} from '../lib/tasks-json-sync';

export type { Task, CustomTask, InteractionType };

export interface OnboardingDraft {
  firstName: string;
  dateOfBirth: string;
  morningKickstart: 1 | 2 | 3 | null;
  socialConnection: 1 | 2 | 3 | null;
  recharge: 1 | 2 | 3 | null;
}

export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    firstName: '',
    dateOfBirth: '',
    morningKickstart: null,
    socialConnection: null,
    recharge: null,
  };
}

export const FALLBACK_GEMINI_TASKS: Task[] = [
  normalizeTask({
    id: 'morning',
    icon: 'sunny-outline',
    icon_type: 'sun',
    title: 'Morning Routine',
    subtitle: 'A gentle start aligned with how you like to wake your mind.',
    duration: '15M',
    timeOfDay: 'morning',
    enabled: true,
    interaction_type: 'timer',
    duration_minutes: 15,
    completed: false,
  }),
  normalizeTask({
    id: 'social',
    icon: 'people-outline',
    icon_type: 'social',
    title: 'Social Check-in',
    subtitle: 'A small moment to connect in the way that feels natural to you.',
    duration: '10M',
    timeOfDay: 'afternoon',
    enabled: true,
    interaction_type: 'photo_upload',
    completed: false,
  }),
  normalizeTask({
    id: 'focus',
    icon: 'phone-portrait-outline',
    icon_type: 'phone',
    title: 'Phone-Free Hour',
    subtitle: 'Protect space for deep focus or rest from screens.',
    duration: '60M',
    timeOfDay: 'afternoon',
    enabled: true,
    interaction_type: 'timer',
    duration_minutes: 60,
    completed: false,
  }),
  normalizeTask({
    id: 'evening',
    icon: 'moon-outline',
    icon_type: 'moon',
    title: 'Evening Wind-Down',
    subtitle: 'Ease into rest the way your nervous system prefers.',
    duration: '20M',
    timeOfDay: 'evening',
    enabled: true,
    interaction_type: 'simple_check',
    completed: false,
  }),
];

type GeminiTaskJson = {
  id: string;
  title: string;
  description: string;
  icon_type: string;
  interaction_type: InteractionType;
  duration_minutes?: number;
  completed?: boolean;
};

const ID_TIME: Record<string, Task['timeOfDay']> = {
  morning: 'morning',
  social: 'afternoon',
  focus: 'afternoon',
  evening: 'evening',
};

const ID_ICON: Record<string, string> = {
  morning: 'sunny-outline',
  social: 'people-outline',
  focus: 'phone-portrait-outline',
  evening: 'moon-outline',
};

function coerceMinutes(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(String(v).replace(/,/g, '.'));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Maps Gemini JSON → tasks and clamps timer lengths to realistic ranges. */
export function mapGeminiJsonToTasks(raw: unknown): Task[] | null {
  const arr = extractJsonArray(raw);
  if (!arr || arr.length !== 4) return null;
  const out: Task[] = [];
  for (const item of arr) {
    const o = item as Partial<GeminiTaskJson> & Record<string, unknown>;
    if (
      typeof o?.id !== 'string' ||
      typeof o?.title !== 'string' ||
      typeof o?.description !== 'string'
    ) {
      return null;
    }
    const interactionRaw = String(o.interaction_type ?? '')
      .trim()
      .toLowerCase();
    if (!['timer', 'photo_upload', 'simple_check'].includes(interactionRaw)) {
      return null;
    }
    const interaction = interactionRaw as InteractionType;
    let durationMinutes: number | undefined;
    if (interaction === 'timer') {
      const dm = coerceMinutes(o.duration_minutes);
      if (dm == null || dm < 1 || dm > 180) return null;
      durationMinutes = dm;
    }
    const iconType =
      typeof o.icon_type === 'string' && o.icon_type.trim().length > 0
        ? o.icon_type.trim()
        : 'leaf';
    const timeOfDay = ID_TIME[o.id] ?? 'morning';
    const baseIcon = ID_ICON[o.id] ?? 'leaf-outline';
    const task = normalizeTask({
      id: o.id,
      icon: baseIcon,
      icon_type: iconType,
      title: o.title,
      subtitle: o.description,
      duration: formatDurationMinutesLabel(durationMinutes),
      timeOfDay,
      enabled: true,
      interaction_type: interaction,
      duration_minutes: durationMinutes,
      completed: false,
    });
    out.push(task);
  }
  return applySensibleTimerDurations(out);
}

export const PERSIST_STORAGE_KEY = 'aurafarm-storage';

const defaultTasks: Task[] = [
  normalizeTask({
    id: '1',
    icon: 'sunny-outline',
    icon_type: 'sun',
    title: 'Morning Breathwork',
    subtitle: 'Center yourself with 4-7-8 breathing',
    duration: '15M',
    timeOfDay: 'morning',
    enabled: true,
    interaction_type: 'timer',
    duration_minutes: 15,
  }),
  normalizeTask({
    id: '2',
    icon: 'water-outline',
    icon_type: 'drop',
    title: 'Hydration Ritual',
    subtitle: 'Nourish your body with mindful sips',
    timeOfDay: 'afternoon',
    enabled: true,
    interaction_type: 'simple_check',
  }),
  normalizeTask({
    id: '3',
    icon: 'book-outline',
    icon_type: 'book',
    title: 'Gratitude Journal',
    subtitle: 'Write three blessings from today',
    duration: '10M',
    timeOfDay: 'evening',
    enabled: true,
    interaction_type: 'simple_check',
  }),
  normalizeTask({
    id: '4',
    icon: 'leaf-outline',
    icon_type: 'leaf',
    title: 'Forest Bathing Walk',
    subtitle: "Immerse yourself in nature's calm",
    duration: '30M',
    timeOfDay: 'morning',
    enabled: true,
    interaction_type: 'timer',
    duration_minutes: 30,
  }),
];

interface AppState {
  userName: string;
  avatarImage: string | null;
  hasCompletedOnboarding: boolean;
  journeyMode: 'solo' | 'friend' | 'anonymous';

  currentStreak: number;
  longestStreak: number;
  longestStreakEndDate: string | null;
  lastCompletedDate: string | null;

  tasks: Task[];
  todayCompletions: string[];

  /** Legacy / teammate: session count & heatmap feed (optional Supabase tables). */
  totalSessionsCompleted: number;
  weeklyAvg: number;
  heatmapData: number[];
  activeDays90: number;

  totalXP: number;
  level: number;
  levelTitle: 'Seeker' | 'Explorer' | 'Architect' | 'AuraFarm Master';

  lastLogicalDateKey: string | null;
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>;
  weeklyActiveDaysCount: number;

  privacyPreset: 'only_me' | 'circles' | 'global';
  permissions: {
    vitals: boolean;
    mindfulness: boolean;
    location: boolean;
  };

  serverNotifications: RemoteNotification[];
  unreadCount: number;

  stressMode: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  notifDailyRituals: boolean;
  notifEncouragement: boolean;
  notifProgressNudges: boolean;
  theme: 'light' | 'dark' | 'forest';

  /** Simulated Apple Health linkage (Expo Go–safe; no native HealthKit module). */
  isHealthConnected: boolean;
  biometrics: { steps: number; sleepHours: number; socialBattery: number };
  connectHealth: () => void;

  onboardingDraft: OnboardingDraft;
  setOnboardingDraft: (partial: Partial<OnboardingDraft>) => void;
  clearOnboardingDraft: () => void;

  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  /** False until first remote profile sync finishes (or no Supabase / no session). Avoid onboarding flash for returning users. */
  _remoteProfileReady: boolean;
  bootstrapSessionFromSupabase: () => Promise<void>;
  completeTask: (taskId: string) => void | Promise<void>;
  addXP: (amount: number) => void;
  setPrivacyPreset: (preset: 'only_me' | 'circles' | 'global') => void;
  togglePermission: (key: 'vitals' | 'mindfulness' | 'location') => void;
  setStressMode: (mode: 'low' | 'medium' | 'high') => void;
  setOnboardingComplete: () => void;
  setJourneyMode: (mode: 'solo' | 'friend' | 'anonymous') => void;
  setNotificationsEnabled: (v: boolean) => void;
  setNotifDailyRituals: (v: boolean) => void;
  setNotifEncouragement: (v: boolean) => void;
  setNotifProgressNudges: (v: boolean) => void;
  setTheme: (t: 'light' | 'dark' | 'forest') => void;
  updateTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTaskEnabled: (taskId: string) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  persistTasksToProfile: () => Promise<void>;

  setUserName: (name: string) => void;
  setAvatarImage: (uri: string | null) => void;

  /** Aligns logical day, pulls `profiles` + `daily_logs`, then optional legacy heatmap/weekly tables. */
  syncUserStats: () => Promise<void>;

  /** Notifications */
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;

  /** Pass `userId` right after sign-in so the session is not read before it is persisted (avoids skipping the sync). */
  refreshDashboardStatsFromRemote: (userId?: string) => Promise<void>;
  ensureLogicalDayAligned: () => void;

  resetLocalSession: () => void;
}

function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

const PRUNE_LOG_DAYS = 21;

function pruneDailyLogs(
  map: Record<string, Partial<DailyLogFlags>>,
  anchor: string,
): Record<string, Partial<DailyLogFlags>> {
  const keep = new Set(getLogicalDateRange(anchor, PRUNE_LOG_DAYS));
  const out: Record<string, Partial<DailyLogFlags>> = {};
  for (const k of Object.keys(map)) {
    if (keep.has(k)) out[k] = map[k];
  }
  return out;
}

function getDefaultSessionState(): Omit<
  AppState,
  | 'setHasHydrated'
  | 'completeTask'
  | 'addXP'
  | 'setPrivacyPreset'
  | 'togglePermission'
  | 'setStressMode'
  | 'setOnboardingComplete'
  | 'setJourneyMode'
  | 'setNotificationsEnabled'
  | 'setNotifDailyRituals'
  | 'setNotifEncouragement'
  | 'setNotifProgressNudges'
  | 'setTheme'
  | 'connectHealth'
  | 'updateTasks'
  | 'addTask'
  | 'toggleTaskEnabled'
  | 'updateTask'
  | 'deleteTask'
  | 'persistTasksToProfile'
  | 'setUserName'
  | 'setAvatarImage'
  | 'setOnboardingDraft'
  | 'clearOnboardingDraft'
  | 'refreshDashboardStatsFromRemote'
  | 'bootstrapSessionFromSupabase'
  | 'ensureLogicalDayAligned'
  | 'resetLocalSession'
  | 'syncUserStats'
  | 'fetchNotifications'
  | 'markNotificationRead'
> {
  return {
    userName: 'Guest',
    avatarImage: null,
    hasCompletedOnboarding: false,
    journeyMode: 'solo',
    onboardingDraft: emptyOnboardingDraft(),

    currentStreak: 0,
    longestStreak: 0,
    longestStreakEndDate: null,
    lastCompletedDate: null,

    tasks: defaultTasks.map((t) => ({ ...t })),
    todayCompletions: [],
    totalSessionsCompleted: 0,
    weeklyAvg: 0,
    heatmapData: new Array(getDaysInCurrentMonth()).fill(0),
    activeDays90: 0,

    totalXP: 0,
    level: 1,
    levelTitle: 'Seeker',

    lastLogicalDateKey: null,
    dailyLogsByDate: {},
    weeklyActiveDaysCount: 0,

    privacyPreset: 'only_me',
    permissions: { vitals: false, mindfulness: true, location: false },

    stressMode: 'medium',
    notificationsEnabled: true,
    notifDailyRituals: true,
    notifEncouragement: false,
    notifProgressNudges: true,
    theme: 'light',

    serverNotifications: [],
    unreadCount: 0,

    isHealthConnected: false,
    biometrics: { steps: 0, sleepHours: 0, socialBattery: 0 },

    _hasHydrated: true,
    _remoteProfileReady: true,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: 'Guest',
      avatarImage: null,
      hasCompletedOnboarding: false,
      journeyMode: 'solo' as const,

      currentStreak: 0,
      longestStreak: 0,
      longestStreakEndDate: null,
      lastCompletedDate: null,

      tasks: defaultTasks,
      todayCompletions: [],
      totalSessionsCompleted: 0,
      weeklyAvg: 0,
      heatmapData: new Array(getDaysInCurrentMonth()).fill(0),
      activeDays90: 0,

      totalXP: 0,
      level: 1,
      levelTitle: 'Seeker' as const,

      lastLogicalDateKey: null,
      dailyLogsByDate: {},
      weeklyActiveDaysCount: 0,

      privacyPreset: 'only_me' as const,
      permissions: { vitals: false, mindfulness: true, location: false },

      stressMode: 'medium' as const,
      notificationsEnabled: true,
      notifDailyRituals: true as const,
      notifEncouragement: false as const,
      notifProgressNudges: true as const,
      theme: 'light' as const,

      serverNotifications: [],
      unreadCount: 0,

      isHealthConnected: false,
      biometrics: { steps: 0, sleepHours: 0, socialBattery: 0 },

      onboardingDraft: emptyOnboardingDraft(),
      setOnboardingDraft: (partial) =>
        set((s) => ({
          onboardingDraft: { ...s.onboardingDraft, ...partial },
        })),
      clearOnboardingDraft: () =>
        set({ onboardingDraft: emptyOnboardingDraft() }),

      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      _remoteProfileReady: false,

      bootstrapSessionFromSupabase: async () => {
        if (!isSupabaseConfigured) {
          set({ _remoteProfileReady: true });
          return;
        }
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          set({ _remoteProfileReady: true });
          return;
        }
        await get().refreshDashboardStatsFromRemote();
        await get().fetchNotifications();
      },

      setUserName: (userName) => set({ userName }),
      setAvatarImage: (uri) => set({ avatarImage: uri }),

      ensureLogicalDayAligned: () => {
        const anchor = getLogicalDateString();
        let { lastLogicalDateKey, todayCompletions, dailyLogsByDate, tasks } =
          get();
        if (lastLogicalDateKey && lastLogicalDateKey !== anchor) {
          const prevFlags = flagsFromTaskIds(todayCompletions, tasks);
          dailyLogsByDate = pruneDailyLogs(
            {
              ...dailyLogsByDate,
              [lastLogicalDateKey]: {
                ...dailyLogsByDate[lastLogicalDateKey],
                ...prevFlags,
              },
            },
            anchor,
          );
          const emptyFlags = flagsFromTaskIds([], tasks);
          set({
            lastLogicalDateKey: anchor,
            todayCompletions: [],
            dailyLogsByDate,
            weeklyActiveDaysCount: computeWeeklyActiveDays(
              dailyLogsByDate,
              anchor,
              emptyFlags,
            ),
            currentStreak: computeCurrentStreak(
              dailyLogsByDate,
              anchor,
              emptyFlags,
            ),
          });

          if (get().notificationsEnabled) {
            scheduleDailyReminders(
              true,
              {
                dailyRituals: get().notifDailyRituals,
                encouragement: get().notifEncouragement,
                progressNudges: get().notifProgressNudges,
              },
              get().todayCompletions.length < get().tasks.length,
            ).catch(() => {});
          }
        } else if (!lastLogicalDateKey) {
          set({ lastLogicalDateKey: anchor });
        }
      },

      refreshDashboardStatsFromRemote: async (userIdOverride?: string) => {
        get().ensureLogicalDayAligned();
        if (!isSupabaseConfigured) {
          set({ _remoteProfileReady: true });
          return;
        }
        let uid = userIdOverride;
        let authMeta: Record<string, any> | undefined = undefined;
        if (!uid) {
          const { data: auth } = await supabase.auth.getUser();
          uid = auth.user?.id;
          authMeta = auth.user?.user_metadata;
        }
        if (!uid) {
          set({ _remoteProfileReady: true });
          return;
        }

        const {
          profile,
          dailyLogsByDate: remoteLogs,
          dailyLogRowCount,
          error,
        } = await fetchDashboardSnapshot(uid);
        if (error) {
          set({ _remoteProfileReady: true });
          return;
        }

        get().ensureLogicalDayAligned();
        const anchor = getLogicalDateString();
        const st = get();

        const remoteDone = inferHasCompletedOnboarding(
          profile,
          dailyLogRowCount,
        );
        const parsedTasks = parseTasksFromProfileJson(profile?.tasks_json);
        let tasks = st.tasks;
        if (parsedTasks && parsedTasks.length > 0) {
          tasks = parsedTasks.map((t, i) => normalizeTask(t, i));
        }

        const merged: Record<string, Partial<DailyLogFlags>> = {
          ...st.dailyLogsByDate,
          ...remoteLogs,
        };
        const dailyLogsByDate = pruneDailyLogs(merged, anchor);

        const todayRow = dailyLogsByDate[anchor];
        const fromFlags = (f: DailyLogFlags) =>
          completionIdsFromFlags(f, tasks);
        const serverToday = todayRow
          ? fromFlags({
              morning_done: Boolean(todayRow.morning_done),
              social_done: Boolean(todayRow.social_done),
              phone_free_done: Boolean(todayRow.phone_free_done),
              evening_done: Boolean(todayRow.evening_done),
            })
          : [];
        const validIds = new Set(tasks.map((t) => t.id));
        const todayCompletions = [
          ...new Set([
            ...st.todayCompletions.filter((id) => validIds.has(id)),
            ...serverToday,
          ]),
        ].filter((id) => validIds.has(id));

        const flags = flagsFromTaskIds(todayCompletions, tasks);
        const weeklyActiveDaysCount = computeWeeklyActiveDays(
          dailyLogsByDate,
          anchor,
          flags,
        );
        const computedStreak = computeCurrentStreak(
          dailyLogsByDate,
          anchor,
          flags,
        );
        const profileStreak = profile?.current_streak ?? 0;
        const currentStreak = Math.max(computedStreak, profileStreak);

        const totalXP = profile?.total_xp ?? st.totalXP;
        const level = getLevelFromTotalXP(totalXP);
        const longestStreak = Math.max(st.longestStreak, currentStreak);
        const longestStreakEndDate = computeLongestStreakEndDate(
          dailyLogsByDate,
          anchor,
        );
        const userName =
          profile?.full_name ?? authMeta?.full_name ?? st.userName;
        const avatarImage =
          profile?.avatar_url ?? authMeta?.avatar_url ?? st.avatarImage;

        set({
          tasks,
          hasCompletedOnboarding: remoteDone || st.hasCompletedOnboarding,
          dailyLogsByDate,
          todayCompletions,
          lastLogicalDateKey: anchor,
          weeklyActiveDaysCount,
          currentStreak,
          longestStreak,
          longestStreakEndDate,
          totalXP,
          level,
          levelTitle: getGrowthTierTitle(level),
          userName,
          avatarImage,
          _remoteProfileReady: true,
        });
      },

      syncUserStats: async () => {
        get().ensureLogicalDayAligned();
        await get().refreshDashboardStatsFromRemote();

        if (!isSupabaseConfigured) return;
        try {
          const { data: auth } = await supabase.auth.getUser();
          const user = auth.user;
          if (!user) return;

          const { count: sessionsCount } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true);

          const { data: reportData } = await supabase
            .from('reports')
            .select('completion_rate')
            .eq('user_id', user.id)
            .eq('type', 'weekly')
            .order('generated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const now = new Date();
          const firstDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          );
          const currentMonthStr = firstDayOfMonth.toISOString();

          const { data: activityData } = await supabase
            .from('tasks')
            .select('updated_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('updated_at', currentMonthStr);

          const daysInMonth = getDaysInCurrentMonth();
          const heatmapArray = new Array(daysInMonth).fill(0);
          if (activityData) {
            activityData.forEach((row) => {
              if (row.updated_at) {
                const date = new Date(row.updated_at);
                if (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                ) {
                  const idx = date.getDate() - 1;
                  heatmapArray[idx] = Math.min(1, heatmapArray[idx] + 0.34);
                }
              }
            });
          }

          const past90DaysStr = new Date(
            now.getTime() - 90 * 24 * 60 * 60 * 1000,
          ).toISOString();
          const { data: activity90 } = await supabase
            .from('tasks')
            .select('updated_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('updated_at', past90DaysStr);

          let fetchedActiveDays90 = 0;
          if (activity90) {
            const uniqueDays = new Set(
              activity90.map((r) => new Date(r.updated_at).toDateString()),
            );
            fetchedActiveDays90 = uniqueDays.size;
          }

          set((state) => ({
            totalSessionsCompleted: Math.max(
              state.totalSessionsCompleted,
              sessionsCount || 0,
            ),
            weeklyAvg:
              reportData?.completion_rate != null
                ? Number(reportData.completion_rate)
                : state.weeklyAvg,
            heatmapData: heatmapArray.some((v) => v > 0)
              ? heatmapArray
              : state.heatmapData,
            activeDays90: Math.max(state.activeDays90, fetchedActiveDays90),
          }));
        } catch (e) {
          console.log('Legacy stats sync skipped', e);
        }
      },

      fetchNotifications: async () => {
        if (!isSupabaseConfigured) return;
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) return;

        const { data, error } = await fetchRemoteNotifications(uid);
        if (!error && data) {
          const unreadCount = data.filter((n) => !n.is_read).length;
          set({ serverNotifications: data, unreadCount });
        }
      },

      markNotificationRead: async (id: string) => {
        const { serverNotifications } = get();
        const notification = serverNotifications.find((n) => n.id === id);

        if (notification && !notification.is_read) {
          // Optimistic local update
          const updated = serverNotifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n,
          );
          set({
            serverNotifications: updated,
            unreadCount: Math.max(0, get().unreadCount - 1),
          });

          if (isSupabaseConfigured) {
            await markNotificationReadRemote(id);
          }
        }
      },

      resetLocalSession: () => {
        if (isSupabaseConfigured) {
          void supabase.auth.signOut();
        }
        void AsyncStorage.removeItem(PERSIST_STORAGE_KEY).catch(() => {});
        set({
          ...getDefaultSessionState(),
        });
      },

      completeTask: (taskId) => {
        get().ensureLogicalDayAligned();
        const st = get();
        const anchor = getLogicalDateString();
        let {
          todayCompletions,
          dailyLogsByDate,
          tasks,
          totalXP,
          longestStreak,
          totalSessionsCompleted,
          heatmapData,
          activeDays90,
        } = st;

        if (todayCompletions.includes(taskId)) return;
        const taskDef = tasks.find((t) => t.id === taskId);
        if (!taskDef) return;

        const beforeFlags = flagsFromTaskIds(todayCompletions, tasks);
        const newCompletions = [...todayCompletions, taskId];
        const afterFlags = flagsFromTaskIds(newCompletions, tasks);

        let xpGain = XP_PER_TASK;
        if (
          countTasksDone(beforeFlags) === 3 &&
          countTasksDone(afterFlags) === 4
        ) {
          xpGain += XP_BONUS_ALL_FOUR;
        }

        const newXP = totalXP + xpGain;
        const newLevel = getLevelFromTotalXP(newXP);

        dailyLogsByDate = pruneDailyLogs(
          {
            ...dailyLogsByDate,
            [anchor]: { ...dailyLogsByDate[anchor], ...afterFlags },
          },
          anchor,
        );

        const weeklyActiveDaysCount = computeWeeklyActiveDays(
          dailyLogsByDate,
          anchor,
          afterFlags,
        );
        const currentStreak = computeCurrentStreak(
          dailyLogsByDate,
          anchor,
          afterFlags,
        );
        const longest = Math.max(longestStreak, currentStreak);

        const isNewActiveDay = todayCompletions.length === 0;
        const newSessionsCount = totalSessionsCompleted + 1;
        const newActiveDays90 = activeDays90 + (isNewActiveDay ? 1 : 0);

        const daysInMonth = getDaysInCurrentMonth();
        let curHeatmap = [...(heatmapData || [])];
        if (curHeatmap.length !== daysInMonth) {
          curHeatmap = new Array(daysInMonth).fill(0);
        }
        const todayIdx = new Date().getDate() - 1;
        if (todayIdx >= 0 && todayIdx < curHeatmap.length) {
          curHeatmap[todayIdx] = Math.min(1, curHeatmap[todayIdx] + 0.34);
        }

        set({
          lastLogicalDateKey: anchor,
          todayCompletions: newCompletions,
          dailyLogsByDate,
          totalXP: newXP,
          level: newLevel,
          levelTitle: getGrowthTierTitle(newLevel),
          currentStreak,
          longestStreak: longest,
          lastCompletedDate: anchor,
          weeklyActiveDaysCount,
          totalSessionsCompleted: newSessionsCount,
          heatmapData: curHeatmap,
          activeDays90: newActiveDays90,
        });

        // Update notifications schedule immediately
        if (st.notificationsEnabled) {
          scheduleDailyReminders(
            true,
            {
              dailyRituals: st.notifDailyRituals,
              encouragement: st.notifEncouragement,
              progressNudges: st.notifProgressNudges,
            },
            newCompletions.length < st.tasks.length,
          ).catch(() => {});
        }

        void (async () => {
          if (!isSupabaseConfigured) return;
          const { data: auth } = await supabase.auth.getUser();
          const uid = auth.user?.id;
          if (!uid) return;
          await upsertDailyLogRemote(uid, anchor, afterFlags);
          await updateProfileStatsRemote(uid, {
            total_xp: newXP,
            current_streak: currentStreak,
          });

          try {
            const nowISO = new Date().toISOString();
            await supabase.from('tasks').insert({
              user_id: uid,
              title: taskDef.title,
              completed: true,
              updated_at: nowISO,
            });
          } catch (e) {
            console.log('Optional tasks row insert skipped', e);
          }
        })();
      },

      addXP: (amount) => {
        const newXP = get().totalXP + amount;
        const newLevel = getLevelFromTotalXP(newXP);
        set({
          totalXP: newXP,
          level: newLevel,
          levelTitle: getGrowthTierTitle(newLevel),
        });
      },

      setPrivacyPreset: (preset) => set({ privacyPreset: preset }),
      togglePermission: (key) =>
        set((s) => ({
          permissions: { ...s.permissions, [key]: !s.permissions[key] },
        })),
      setStressMode: (mode) => set({ stressMode: mode }),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setJourneyMode: (mode) => set({ journeyMode: mode }),
      setNotificationsEnabled: (v) => {
        set({ notificationsEnabled: v });
        scheduleDailyReminders(
          v,
          {
            dailyRituals: get().notifDailyRituals,
            encouragement: get().notifEncouragement,
            progressNudges: get().notifProgressNudges,
          },
          get().todayCompletions.length < get().tasks.length,
        ).catch(() => {});
      },
      setNotifDailyRituals: (v) => {
        set({ notifDailyRituals: v });
        if (get().notificationsEnabled) {
          scheduleDailyReminders(
            true,
            {
              dailyRituals: v,
              encouragement: get().notifEncouragement,
              progressNudges: get().notifProgressNudges,
            },
            get().todayCompletions.length < get().tasks.length,
          ).catch(() => {});
        }
      },
      setNotifEncouragement: (v) => {
        set({ notifEncouragement: v });
        if (get().notificationsEnabled) {
          scheduleDailyReminders(
            true,
            {
              dailyRituals: get().notifDailyRituals,
              encouragement: v,
              progressNudges: get().notifProgressNudges,
            },
            get().todayCompletions.length < get().tasks.length,
          ).catch(() => {});
        }
      },
      setNotifProgressNudges: (v) => {
        set({ notifProgressNudges: v });
        if (get().notificationsEnabled) {
          scheduleDailyReminders(
            true,
            {
              dailyRituals: get().notifDailyRituals,
              encouragement: get().notifEncouragement,
              progressNudges: v,
            },
            get().todayCompletions.length < get().tasks.length,
          ).catch(() => {});
        }
      },
      setTheme: (t) => set({ theme: t }),

      connectHealth: () => {
        const steps = 3000 + Math.floor(Math.random() * 5001);
        const sleepRaw = 4.5 + Math.random() * 3;
        const sleepHours = Math.round(sleepRaw * 10) / 10;
        const socialBattery = 20 + Math.floor(Math.random() * 61);
        set({
          isHealthConnected: true,
          biometrics: { steps, sleepHours, socialBattery },
        });
      },

      updateTasks: (next) => {
        set({ tasks: next.map((t, i) => normalizeTask(t, i)) });
        scheduleProfileTasksJsonSync(() => get().tasks);
      },
      addTask: (task) => {
        set((s) => {
          const idx = s.tasks.length;
          return {
            tasks: [
              ...s.tasks,
              normalizeTask(
                {
                  ...task,
                  interaction_type: task.interaction_type ?? 'simple_check',
                },
                idx,
              ),
            ],
          };
        });
        scheduleProfileTasksJsonSync(() => get().tasks);
      },
      toggleTaskEnabled: (taskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, enabled: !t.enabled } : t,
          ),
        }));
        scheduleProfileTasksJsonSync(() => get().tasks);
      },

      updateTask: (taskId, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t, i) =>
            t.id === taskId
              ? normalizeTask({ ...t, ...patch }, i)
              : t,
          ),
        }));
        scheduleProfileTasksJsonSync(() => get().tasks);
      },

      deleteTask: (taskId) => {
        set((s) => {
          if (s.tasks.length <= 1) return s;
          return {
            tasks: s.tasks.filter((t) => t.id !== taskId),
            todayCompletions: s.todayCompletions.filter((id) => id !== taskId),
          };
        });
        scheduleProfileTasksJsonSync(() => get().tasks);
      },

      persistTasksToProfile: async () => {
        await flushProfileTasksJsonSync(() => get().tasks);
      },
    }),
    {
      name: PERSIST_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userName: state.userName,
        avatarImage: state.avatarImage,
        journeyMode: state.journeyMode,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastCompletedDate: state.lastCompletedDate,
        tasks: state.tasks,
        todayCompletions: state.todayCompletions,
        totalSessionsCompleted: state.totalSessionsCompleted,
        weeklyAvg: state.weeklyAvg,
        heatmapData: state.heatmapData,
        activeDays90: state.activeDays90,
        totalXP: state.totalXP,
        level: state.level,
        levelTitle: state.levelTitle,
        lastLogicalDateKey: state.lastLogicalDateKey,
        dailyLogsByDate: state.dailyLogsByDate,
        weeklyActiveDaysCount: state.weeklyActiveDaysCount,
        privacyPreset: state.privacyPreset,
        permissions: state.permissions,
        stressMode: state.stressMode,
        notificationsEnabled: state.notificationsEnabled,
        notifDailyRituals: state.notifDailyRituals,
        notifEncouragement: state.notifEncouragement,
        notifProgressNudges: state.notifProgressNudges,
        theme: state.theme,
        isHealthConnected: state.isHealthConnected,
        biometrics: state.biometrics,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        queueMicrotask(() => {
          useAppStore.getState().ensureLogicalDayAligned();
          void useAppStore.getState().bootstrapSessionFromSupabase();
        });
      },
    },
  ),
);
