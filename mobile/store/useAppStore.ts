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

  /** Clears persisted data and resets to defaults; signs out of Supabase when configured. */
  resetLocalSession: () => void;
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
        const { todayCompletions, totalXP } = get();
        if (todayCompletions.includes(taskId)) return;
        const newXP = totalXP + 50;
        const newLevel = getLevelFromXP(newXP);
        set({
          todayCompletions: [...todayCompletions, taskId],
          totalXP: newXP,
          level: newLevel,
          levelTitle: getLevelTitle(newLevel),
        });
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
