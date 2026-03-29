import { supabase, isSupabaseConfigured } from './supabase';
import type { DailyLogFlags } from './dashboard-stats';
import { addLogicalDays, getLogicalDateString } from './logical-date';

type ProfileRow = {
  id: string;
  full_name: string | null;
  total_xp: number;
  current_streak: number;
  last_active_date: string | null;
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

export async function fetchDashboardSnapshot(userId: string): Promise<{
  profile: ProfileRow | null;
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>;
  error: Error | null;
}> {
  if (!isSupabaseConfigured) {
    return { profile: null, dailyLogsByDate: {}, error: null };
  }

  const anchor = getLogicalDateString();
  const minDate = addLogicalDays(anchor, -14);

  const [profileRes, logsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, total_xp, current_streak, last_active_date').eq('id', userId).maybeSingle(),
    supabase
      .from('daily_logs')
      .select('log_date, morning_done, social_done, phone_free_done, evening_done')
      .eq('user_id', userId)
      .gte('log_date', minDate)
      .order('log_date', { ascending: true }),
  ]);

  const err =
    profileRes.error && profileRes.error.code !== 'PGRST116' ? profileRes.error : logsRes.error ? logsRes.error : null;

  const dailyLogsByDate: Record<string, Partial<DailyLogFlags>> = {};
  for (const row of logsRes.data ?? []) {
    const r = row as DailyLogRow;
    dailyLogsByDate[r.log_date] = {
      morning_done: r.morning_done,
      social_done: r.social_done,
      phone_free_done: r.phone_free_done,
      evening_done: r.evening_done,
    };
  }

  return {
    profile: (profileRes.data as ProfileRow) ?? null,
    dailyLogsByDate,
    error: err ? new Error(err.message) : null,
  };
}
