import { supabase, isSupabaseConfigured } from './supabase';
import type { DailyLogFlags } from './dashboard-stats';
import type { Task } from '../types/task';
import { normalizeTask } from './task-model';
import { addLogicalDays, getLogicalDateString } from './logical-date';

export interface RemoteNotification {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  task_id: string | null;
  icon: string | null;
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  total_xp: number;
  current_streak: number;
  last_active_date: string | null;
  has_completed_onboarding?: boolean | null;
  tasks_json?: unknown | null;
  avatar_url?: string | null;
};

type DailyLogRow = {
  log_date: string;
  morning_done: boolean;
  social_done: boolean;
  phone_free_done: boolean;
  evening_done: boolean;
};

export async function upsertDailyLogRemote(
  userId: string,
  logDate: string,
  flags: DailyLogFlags
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.from('daily_logs').upsert(
    {
      user_id: userId,
      log_date: logDate,
      morning_done: flags.morning_done,
      social_done: flags.social_done,
      phone_free_done: flags.phone_free_done,
      evening_done: flags.evening_done,
    },
    { onConflict: 'user_id,log_date' }
  );
  return { error: error ? new Error(error.message) : null };
}

export async function updateProfileStatsRemote(
  userId: string,
  patch: { total_xp: number; current_streak: number }
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase
    .from('profiles')
    .update({
      total_xp: patch.total_xp,
      current_streak: patch.current_streak,
      last_active_date: new Date().toISOString(),
    })
    .eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}

export async function fetchRemoteNotifications(userId: string): Promise<{ data: RemoteNotification[]; error: Error | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    if (error.message.includes('relation "notifications" does not exist')) {
      console.log('Notifications table not created gracefully handling');
      return { data: [], error: null };
    }
    return { data: [], error: new Error(error.message) };
  }
  return { data: (data as RemoteNotification[]) || [], error: null };
}

export async function markNotificationReadRemote(
  notificationId: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  return { error: error ? new Error(error.message) : null };
}

/** After onboarding step 5: mark done, save rituals JSON, XP + streak. */
export async function saveOnboardingCompleteToProfile(
  userId: string,
  payload: {
    tasks: Task[];
    total_xp: number;
    current_streak: number;
  }
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      has_completed_onboarding: true,
      tasks_json: payload.tasks,
      total_xp: payload.total_xp,
      current_streak: payload.current_streak,
      last_active_date: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  return { error: error ? new Error(error.message) : null };
}

/** Persist ritual definitions after Customize (edit/delete). */
export async function updateProfileTasksJsonRemote(
  userId: string,
  tasks: Task[]
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase
    .from('profiles')
    .update({ tasks_json: tasks, last_active_date: new Date().toISOString() })
    .eq('id', userId);
  return { error: error ? new Error(error.message) : null };
}

function isTaskArray(raw: unknown): raw is Task[] {
  if (!Array.isArray(raw) || raw.length === 0) return false;
  return raw.every(
    (t) =>
      t &&
      typeof t === 'object' &&
      typeof (t as Task).id === 'string' &&
      typeof (t as Task).title === 'string' &&
      typeof (t as Task).subtitle === 'string'
  );
}

export function parseTasksFromProfileJson(raw: unknown): Task[] | null {
  if (!isTaskArray(raw)) return null;
  return raw.map((t) => normalizeTask({ ...t, enabled: t.enabled !== false }));
}

/** When DB column is missing or false, infer from activity (legacy users). */
export function inferHasCompletedOnboarding(
  profile: ProfileRow | null,
  dailyLogRowCount: number
): boolean {
  if (!profile) return false;
  if (profile.has_completed_onboarding === true) return true;
  if (profile.has_completed_onboarding === false) {
    return (profile.total_xp ?? 0) > 0 || (profile.current_streak ?? 0) > 0 || dailyLogRowCount > 0;
  }
  return (
    (profile.total_xp ?? 0) > 0 ||
    (profile.current_streak ?? 0) > 0 ||
    dailyLogRowCount > 0 ||
    (profile.tasks_json != null && isTaskArray(profile.tasks_json))
  );
}

/** Loads profile; retries without optional columns if the migration was not applied yet. */
async function fetchProfileRowFlexible(userId: string): Promise<{
  profile: ProfileRow | null;
  error: Error | null;
}> {
  // Try 1: Everything including avatar_url
  const full = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, total_xp, current_streak, last_active_date, has_completed_onboarding, tasks_json')
    .eq('id', userId)
    .maybeSingle();

  if (!full.error) {
    return { profile: (full.data as ProfileRow) ?? null, error: null };
  }

  // Try 2: Everything except avatar_url
  const noAvatar = await supabase
    .from('profiles')
    .select('id, full_name, total_xp, current_streak, last_active_date, has_completed_onboarding, tasks_json')
    .eq('id', userId)
    .maybeSingle();
    
  if (!noAvatar.error) {
    return { profile: (noAvatar.data as ProfileRow) ?? null, error: null };
  }

  // Try 3: Minimal legacy format
  const minimal = await supabase
    .from('profiles')
    .select('id, full_name, total_xp, current_streak, last_active_date')
    .eq('id', userId)
    .maybeSingle();

  if (minimal.error) {
    return { profile: null, error: new Error(minimal.error.message) };
  }
  return { profile: (minimal.data as ProfileRow) ?? null, error: null };
}

export async function fetchDashboardSnapshot(userId: string): Promise<{
  profile: ProfileRow | null;
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>;
  dailyLogRowCount: number;
  error: Error | null;
}> {
  if (!isSupabaseConfigured) {
    return { profile: null, dailyLogsByDate: {}, dailyLogRowCount: 0, error: null };
  }

  const anchor = getLogicalDateString();
  const minDate = addLogicalDays(anchor, -14);

  const [profileResult, logsRes, logCountRes] = await Promise.all([
    fetchProfileRowFlexible(userId),
    supabase
      .from('daily_logs')
      .select('log_date, morning_done, social_done, phone_free_done, evening_done')
      .eq('user_id', userId)
      .gte('log_date', minDate)
      .order('log_date', { ascending: true }),
    supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const dailyLogsByDate: Record<string, Partial<DailyLogFlags>> = {};
  if (!logsRes.error) {
    for (const row of logsRes.data ?? []) {
      const r = row as DailyLogRow;
      dailyLogsByDate[r.log_date] = {
        morning_done: r.morning_done,
        social_done: r.social_done,
        phone_free_done: r.phone_free_done,
        evening_done: r.evening_done,
      };
    }
  }

  const dailyLogRowCount = logCountRes.error ? 0 : (logCountRes.count ?? 0);

  return {
    profile: profileResult.profile,
    dailyLogsByDate,
    dailyLogRowCount,
    error: profileResult.error,
  };
}
