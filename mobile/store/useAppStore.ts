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
  resolveLogFlagKey,
} from '../lib/dashboard-stats';
import {
  fetchDashboardSnapshot,
  upsertDailyLogRemote,
  updateProfileStatsRemote,
  saveOnboardingCompleteToProfile,
  parseTasksFromProfileJson,
  inferHasCompletedOnboarding,
} from '../lib/sync-dashboard-stats';
import type { Task } from '../types/task';

export type { Task };

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
  {
    id: 'morning',
    icon: 'sunny-outline',
    title: 'Morning Routine',
    subtitle: 'A gentle start aligned with how you like to wake your mind.',
    duration: '15M',
    timeOfDay: 'morning',
    enabled: true,
  },
  {
    id: 'social',
    icon: 'people-outline',
    title: 'Social Check-in',
    subtitle: 'A small moment to connect in the way that feels natural to you.',
    duration: '10M',
    timeOfDay: 'afternoon',
    enabled: true,
  },
  {
    id: 'focus',
    icon: 'phone-portrait-outline',
    title: 'Phone-Free Hour',
    subtitle: 'Protect space for deep focus or rest from screens.',
    duration: '60M',
    timeOfDay: 'afternoon',
    enabled: true,
  },
  {
    id: 'evening',
    icon: 'moon-outline',
    title: 'Evening Wind-Down',
    subtitle: 'Ease into rest the way your nervous system prefers.',
    duration: '20M',
    timeOfDay: 'evening',
    enabled: true,
  },
];

type GeminiTaskJson = {
  id: string;
  title: string;
  description: string;
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

export function mapGeminiJsonToTasks(raw: unknown): Task[] | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const out: Task[] = [];
  for (const item of raw) {
    const o = item as GeminiTaskJson;
    if (
      typeof o?.id !== 'string' ||
      typeof o?.title !== 'string' ||
      typeof o?.description !== 'string'
    ) {
      return null;
    }
    const timeOfDay = ID_TIME[o.id] ?? 'morning';
    out.push({
      id: o.id,
      icon: ID_ICON[o.id] ?? 'leaf-outline',
      title: o.title,
      subtitle: o.description,
      timeOfDay,
      enabled: true,
    });
  }
  return out;
}

export const PERSIST_STORAGE_KEY = 'organic-sanctuary-storage';

const defaultTasks: Task[] = [
  { id: '1', icon: 'sunny-outline', title: 'Morning Breathwork', subtitle: 'Center yourself with 4-7-8 breathing', duration: '15M', timeOfDay: 'morning', enabled: true },
  { id: '2', icon: 'water-outline', title: 'Hydration Ritual', subtitle: 'Nourish your body with mindful sips', timeOfDay: 'afternoon', enabled: true },
  { id: '3', icon: 'book-outline', title: 'Gratitude Journal', subtitle: 'Write three blessings from today', duration: '10M', timeOfDay: 'evening', enabled: true },
  { id: '4', icon: 'leaf-outline', title: 'Forest Bathing Walk', subtitle: 'Immerse yourself in nature\'s calm', duration: '30M', timeOfDay: 'morning', enabled: true },
];

interface AppState {
  userName: string;
  avatarImage: string | null;
  hasCompletedOnboarding: boolean;
  journeyMode: 'solo' | 'friend' | 'anonymous';

  currentStreak: number;
  longestStreak: number;
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
  levelTitle: 'Seeker' | 'Explorer' | 'Architect' | 'Sanctuary Master';

  lastLogicalDateKey: string | null;
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>;
  weeklyActiveDaysCount: number;

  privacyPreset: 'only_me' | 'circles' | 'global';
  permissions: {
    vitals: boolean;
    mindfulness: boolean;
    location: boolean;
  };

  stressMode: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
  reminderTime: '8am' | '10am' | 'off';
  theme: 'light' | 'dark' | 'forest';

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
  setReminderTime: (t: '8am' | '10am' | 'off') => void;
  setTheme: (t: 'light' | 'dark' | 'forest') => void;
  updateTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTaskEnabled: (taskId: string) => void;

  setUserName: (name: string) => void;
  setAvatarImage: (uri: string | null) => void;

  /** Aligns logical day, pulls `profiles` + `daily_logs`, then optional legacy heatmap/weekly tables. */
  syncUserStats: () => Promise<void>;

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
  anchor: string
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
  | 'setReminderTime'
  | 'setTheme'
  | 'updateTasks'
  | 'addTask'
  | 'toggleTaskEnabled'
  | 'setUserName'
  | 'setAvatarImage'
  | 'setOnboardingDraft'
  | 'clearOnboardingDraft'
  | 'refreshDashboardStatsFromRemote'
  | 'bootstrapSessionFromSupabase'
  | 'ensureLogicalDayAligned'
  | 'resetLocalSession'
  | 'syncUserStats'
> {
  return {
    userName: 'Guest',
    avatarImage: null,
    hasCompletedOnboarding: false,
    journeyMode: 'solo',
    onboardingDraft: emptyOnboardingDraft(),

    currentStreak: 0,
    longestStreak: 0,
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
    reminderTime: '8am',
    theme: 'light',

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
      reminderTime: '8am' as const,
      theme: 'light' as const,

      onboardingDraft: emptyOnboardingDraft(),
      setOnboardingDraft: (partial) =>
        set((s) => ({
          onboardingDraft: { ...s.onboardingDraft, ...partial },
        })),
      clearOnboardingDraft: () => set({ onboardingDraft: emptyOnboardingDraft() }),

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
      },

      setUserName: (userName) => set({ userName }),
      setAvatarImage: (uri) => set({ avatarImage: uri }),

      ensureLogicalDayAligned: () => {
        const anchor = getLogicalDateString();
        let { lastLogicalDateKey, todayCompletions, dailyLogsByDate, tasks } = get();
        if (lastLogicalDateKey && lastLogicalDateKey !== anchor) {
          const prevFlags = flagsFromTaskIds(todayCompletions, tasks);
          dailyLogsByDate = pruneDailyLogs(
            {
              ...dailyLogsByDate,
              [lastLogicalDateKey]: { ...dailyLogsByDate[lastLogicalDateKey], ...prevFlags },
            },
            anchor
          );
          const emptyFlags = flagsFromTaskIds([], tasks);
          set({
            lastLogicalDateKey: anchor,
            todayCompletions: [],
            dailyLogsByDate,
            weeklyActiveDaysCount: computeWeeklyActiveDays(dailyLogsByDate, anchor, emptyFlags),
            currentStreak: computeCurrentStreak(dailyLogsByDate, anchor, emptyFlags),
          });
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

        const { profile, dailyLogsByDate: remoteLogs, dailyLogRowCount, error } = await fetchDashboardSnapshot(uid);
        if (error) {
          set({ _remoteProfileReady: true });
          return;
        }

        get().ensureLogicalDayAligned();
        const anchor = getLogicalDateString();
        const st = get();

        const remoteDone = inferHasCompletedOnboarding(profile, dailyLogRowCount);
        const parsedTasks = parseTasksFromProfileJson(profile?.tasks_json);
        let tasks = st.tasks;
        if (parsedTasks && parsedTasks.length > 0) {
          tasks = parsedTasks;
        }

        const merged: Record<string, Partial<DailyLogFlags>> = { ...st.dailyLogsByDate, ...remoteLogs };
        const dailyLogsByDate = pruneDailyLogs(merged, anchor);

        const todayRow = dailyLogsByDate[anchor];
        const fromFlags = (f: DailyLogFlags) => completionIdsFromFlags(f, tasks);
        const serverToday = todayRow
          ? fromFlags({
              morning_done: Boolean(todayRow.morning_done),
              social_done: Boolean(todayRow.social_done),
              phone_free_done: Boolean(todayRow.phone_free_done),
              evening_done: Boolean(todayRow.evening_done),
            })
          : [];
        const validIds = new Set(tasks.map((t) => t.id));
        const todayCompletions = [...new Set([...st.todayCompletions.filter((id) => validIds.has(id)), ...serverToday])].filter(
          (id) => validIds.has(id)
        );

        const flags = flagsFromTaskIds(todayCompletions, tasks);
        const weeklyActiveDaysCount = computeWeeklyActiveDays(dailyLogsByDate, anchor, flags);
        const computedStreak = computeCurrentStreak(dailyLogsByDate, anchor, flags);
        const profileStreak = profile?.current_streak ?? 0;
        const currentStreak = Math.max(computedStreak, profileStreak);

        const totalXP = profile?.total_xp ?? st.totalXP;
        const level = getLevelFromTotalXP(totalXP);
        const longestStreak = Math.max(st.longestStreak, currentStreak);
        const userName = profile?.full_name ?? authMeta?.full_name ?? st.userName;
        const avatarImage = profile?.avatar_url ?? authMeta?.avatar_url ?? st.avatarImage;

        set({
          tasks,
          hasCompletedOnboarding: remoteDone || st.hasCompletedOnboarding,
          dailyLogsByDate,
          todayCompletions,
          lastLogicalDateKey: anchor,
          weeklyActiveDaysCount,
          currentStreak,
          longestStreak,
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
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
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
                if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                  const idx = date.getDate() - 1;
                  heatmapArray[idx] = Math.min(1, heatmapArray[idx] + 0.34);
                }
              }
            });
          }

          const past90DaysStr = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          const { data: activity90 } = await supabase
            .from('tasks')
            .select('updated_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('updated_at', past90DaysStr);

          let fetchedActiveDays90 = 0;
          if (activity90) {
            const uniqueDays = new Set(activity90.map((r) => new Date(r.updated_at).toDateString()));
            fetchedActiveDays90 = uniqueDays.size;
          }

          set((state) => ({
            totalSessionsCompleted: Math.max(state.totalSessionsCompleted, sessionsCount || 0),
            weeklyAvg: reportData?.completion_rate != null ? Number(reportData.completion_rate) : state.weeklyAvg,
            heatmapData: heatmapArray.some((v) => v > 0) ? heatmapArray : state.heatmapData,
            activeDays90: Math.max(state.activeDays90, fetchedActiveDays90),
          }));
        } catch (e) {
          console.log('Legacy stats sync skipped', e);
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
        let { todayCompletions, dailyLogsByDate, tasks, totalXP, longestStreak, totalSessionsCompleted, heatmapData, activeDays90 } = st;

        if (todayCompletions.includes(taskId)) return;
        const taskDef = tasks.find((t) => t.id === taskId);
        if (!taskDef || !resolveLogFlagKey(taskId, tasks)) return;

        const beforeFlags = flagsFromTaskIds(todayCompletions, tasks);
        const newCompletions = [...todayCompletions, taskId];
        const afterFlags = flagsFromTaskIds(newCompletions, tasks);

        let xpGain = XP_PER_TASK;
        if (countTasksDone(beforeFlags) === 3 && countTasksDone(afterFlags) === 4) {
          xpGain += XP_BONUS_ALL_FOUR;
        }

        const newXP = totalXP + xpGain;
        const newLevel = getLevelFromTotalXP(newXP);

        dailyLogsByDate = pruneDailyLogs(
          {
            ...dailyLogsByDate,
            [anchor]: { ...dailyLogsByDate[anchor], ...afterFlags },
          },
          anchor
        );

        const weeklyActiveDaysCount = computeWeeklyActiveDays(dailyLogsByDate, anchor, afterFlags);
        const currentStreak = computeCurrentStreak(dailyLogsByDate, anchor, afterFlags);
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

        void (async () => {
          if (!isSupabaseConfigured) return;
          const { data: auth } = await supabase.auth.getUser();
          const uid = auth.user?.id;
          if (!uid) return;
          await upsertDailyLogRemote(uid, anchor, afterFlags);
          await updateProfileStatsRemote(uid, { total_xp: newXP, current_streak: currentStreak });

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
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setReminderTime: (t) => set({ reminderTime: t }),
      setTheme: (t) => set({ theme: t }),
      updateTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      toggleTaskEnabled: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, enabled: !t.enabled } : t)),
        })),
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
        reminderTime: state.reminderTime,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        queueMicrotask(() => {
          useAppStore.getState().ensureLogicalDayAligned();
          void useAppStore.getState().bootstrapSessionFromSupabase();
        });
      },
    }
  )
);
