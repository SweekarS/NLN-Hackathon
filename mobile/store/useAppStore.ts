import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Task {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  duration?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  enabled: boolean;
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
  totalSessionsCompleted: number;
  weeklyAvg: number;
  heatmapData: number[];
  activeDays90: number;

  totalXP: number;
  level: number;
  levelTitle: 'Rookie' | 'Regular' | 'Master' | 'Legend';

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

  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  completeTask: (taskId: string) => void;
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

  syncUserStats: () => Promise<void>;

  /** Clears persisted data and resets to defaults; signs out of Supabase when configured. */
  resetLocalSession: () => void;
}

function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function getLevelTitle(level: number): 'Rookie' | 'Regular' | 'Master' | 'Legend' {
  if (level <= 10) return 'Rookie';
  if (level <= 30) return 'Regular';
  if (level <= 60) return 'Master';
  return 'Legend';
}

function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

/** Default app state after sign-out / delete-account (local-only). */
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
  | 'resetLocalSession'
  | 'syncUserStats'
> {
  return {
    userName: 'Guest',
    avatarImage: null,
    hasCompletedOnboarding: false,
    journeyMode: 'solo',

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
    levelTitle: 'Rookie',

    privacyPreset: 'only_me',
    permissions: { vitals: false, mindfulness: true, location: false },

    stressMode: 'medium',
    notificationsEnabled: true,
    reminderTime: '8am',
    theme: 'light',

    _hasHydrated: true,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: 'Elena Mistwood',
      avatarImage: null,
      hasCompletedOnboarding: false,
      journeyMode: 'solo' as const,

      currentStreak: 12,
      longestStreak: 42,
      lastCompletedDate: null,

      tasks: defaultTasks,
      todayCompletions: ['2'],
      totalSessionsCompleted: 0,
      weeklyAvg: 0,
      heatmapData: new Array(getDaysInCurrentMonth()).fill(0),
      activeDays90: 0,

      totalXP: 2450,
      level: 14,
      levelTitle: 'Master' as const,

      privacyPreset: 'only_me' as const,
      permissions: { vitals: false, mindfulness: true, location: false },

      stressMode: 'medium' as const,
      notificationsEnabled: true,
      reminderTime: '8am' as const,
      theme: 'light' as const,

      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setUserName: (userName) => set({ userName }),
      setAvatarImage: (uri) => set({ avatarImage: uri }),

      syncUserStats: async () => {
        if (!isSupabaseConfigured) return;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Fetch Streak
          const { data: streakData } = await supabase
            .from('streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', user.id)
            .maybeSingle();

          // Fetch Level
          const { data: levelData } = await supabase
            .from('levels')
            .select('current_level, total_xp')
            .eq('user_id', user.id)
            .maybeSingle();

          // Fetch completed tasks count
          const { count: sessionsCount } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true);

          // Fetch latest weekly avg from reports
          const { data: reportData } = await supabase
            .from('reports')
            .select('completion_rate')
            .eq('user_id', user.id)
            .eq('type', 'weekly')
            .order('generated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Fetch heatmap data over current month
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
            activityData.forEach(row => {
              if (row.updated_at) {
                const date = new Date(row.updated_at);
                if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                  // Index based on day of month (0-indexed)
                  const idx = date.getDate() - 1;
                  heatmapArray[idx] = Math.min(1, heatmapArray[idx] + 0.34); 
                }
              }
            });
          }

          // Fetch active days in last 90 days
          const past90DaysStr = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          const { data: activity90 } = await supabase
            .from('tasks')
            .select('updated_at')
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('updated_at', past90DaysStr);

          let fetchedActiveDays90 = 0;
          if (activity90) {
            const uniqueDays = new Set(activity90.map(r => new Date(r.updated_at).toDateString()));
            fetchedActiveDays90 = uniqueDays.size;
          }

          set((state) => {
            const newXP = Math.max(state.totalXP, levelData?.total_xp || 0);
            const newLevel = Math.max(state.level, levelData?.current_level || 1);
            return {
              currentStreak: Math.max(state.currentStreak, streakData?.current_streak || 0),
              longestStreak: Math.max(state.longestStreak, streakData?.longest_streak || 0),
              level: newLevel,
              totalXP: newXP,
              totalSessionsCompleted: Math.max(state.totalSessionsCompleted, sessionsCount || 0),
              weeklyAvg: reportData?.completion_rate != null ? Number(reportData.completion_rate) : state.weeklyAvg,
              heatmapData: heatmapArray.some(v => v > 0) ? heatmapArray : state.heatmapData, // Avoid overwriting optimistic if fetch raced
              activeDays90: Math.max(state.activeDays90, fetchedActiveDays90),
              levelTitle: getLevelTitle(newLevel),
            };
          });
        } catch (e) {
          console.log('Error syncing stats', e);
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

      completeTask: async (taskId) => {
        const { tasks, todayCompletions, totalXP, totalSessionsCompleted } = get();
        if (todayCompletions.includes(taskId)) return;

        const taskDef = tasks.find((t) => t.id === taskId);
        if (!taskDef) return;

        const newXP = totalXP + 50;
        const newLevel = getLevelFromXP(newXP);
        const newSessionsCount = totalSessionsCompleted + 1;
        const isNewActiveDay = todayCompletions.length === 0;
        const newActiveDays90 = get().activeDays90 + (isNewActiveDay ? 1 : 0);

        // Optimistic UI update instantly!
        const daysInMonth = getDaysInCurrentMonth();
        let curHeatmap = [...(get().heatmapData || [])];
        if (curHeatmap.length !== daysInMonth) {
          curHeatmap = new Array(daysInMonth).fill(0);
        }
        const todayIdx = new Date().getDate() - 1;
        if (todayIdx >= 0 && todayIdx < curHeatmap.length) {
          curHeatmap[todayIdx] = Math.min(1, curHeatmap[todayIdx] + 0.34);
        }

        set({
          todayCompletions: [...todayCompletions, taskId],
          totalXP: newXP,
          level: newLevel,
          levelTitle: getLevelTitle(newLevel),
          totalSessionsCompleted: newSessionsCount,
          heatmapData: curHeatmap,
          activeDays90: newActiveDays90,
        });

        // Background Sync up to Supabase
        if (isSupabaseConfigured) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const nowISO = new Date().toISOString();

              // 1. Log action in tasks history to feed the heatmap array!
              await supabase.from('tasks').insert({
                user_id: user.id,
                title: taskDef.title,
                completed: true,
                updated_at: nowISO,
              });

              // 2. Overwrite total XP pool
              await supabase.from('levels').upsert({
                user_id: user.id,
                total_xp: newXP,
                current_level: newLevel,
                updated_at: nowISO,
              }, { onConflict: 'user_id' });
            }
          } catch (e) {
            console.log('Error pushing task to Supabase:', e);
          }
        }
      },

      addXP: (amount) => {
        const newXP = get().totalXP + amount;
        const newLevel = getLevelFromXP(newXP);
        set({ totalXP: newXP, level: newLevel, levelTitle: getLevelTitle(newLevel) });
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
        privacyPreset: state.privacyPreset,
        permissions: state.permissions,
        stressMode: state.stressMode,
        notificationsEnabled: state.notificationsEnabled,
        reminderTime: state.reminderTime,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
