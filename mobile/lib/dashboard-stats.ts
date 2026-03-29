import type { Task } from '../store/useAppStore';
import { addLogicalDays, getLogicalDateRange, getLogicalDateString } from './logical-date';

/** Matches Supabase daily_logs columns (phone_free_done ↔ focus task). */
export type DailyLogFlags = {
  morning_done: boolean;
  social_done: boolean;
  phone_free_done: boolean;
  evening_done: boolean;
};

export const XP_PER_TASK = 50;
export const XP_BONUS_ALL_FOUR = 50;
export const XP_PER_LEVEL = 500;

export function getLevelFromTotalXP(totalXP: number): number {
  return Math.floor(Math.max(0, totalXP) / XP_PER_LEVEL) + 1;
}

/** Growth tier label from level (not raw XP). */
export function getGrowthTierTitle(level: number): 'Seeker' | 'Explorer' | 'Architect' | 'Sanctuary Master' {
  if (level >= 31) return 'Sanctuary Master';
  if (level >= 16) return 'Architect';
  if (level >= 6) return 'Explorer';
  return 'Seeker';
}

/** XP progress within the current level (0–499) toward the next level. */
export function xpProgressInCurrentLevel(totalXP: number): { intoLevel: number; levelFloor: number; nextLevelTotal: number } {
  const level = getLevelFromTotalXP(totalXP);
  const levelFloor = (level - 1) * XP_PER_LEVEL;
  const nextLevelTotal = level * XP_PER_LEVEL;
  const intoLevel = totalXP - levelFloor;
  return { intoLevel, levelFloor, nextLevelTotal };
}

export function taskIdToLogFlagKey(taskId: string): keyof DailyLogFlags | null {
  switch (taskId) {
    case 'morning':
      return 'morning_done';
    case 'social':
      return 'social_done';
    case 'focus':
      return 'phone_free_done';
    case 'evening':
      return 'evening_done';
    default:
      return null;
  }
}

/** Map legacy or custom task ids: known ids first, else slot index when exactly 4 tasks (0–3). */
export function resolveLogFlagKey(taskId: string, tasks: Task[]): keyof DailyLogFlags | null {
  const direct = taskIdToLogFlagKey(taskId);
  if (direct) return direct;
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (tasks.length === 4 && idx >= 0 && idx <= 3) {
    const bySlot: (keyof DailyLogFlags)[] = ['morning_done', 'social_done', 'phone_free_done', 'evening_done'];
    return bySlot[idx]!;
  }
  return null;
}

/** Which tasks are done today, from boolean flags + current task list. */
export function completionIdsFromFlags(flags: DailyLogFlags, tasks: Task[]): string[] {
  const out: string[] = [];
  for (const t of tasks) {
    const key = resolveLogFlagKey(t.id, tasks);
    if (key && flags[key]) out.push(t.id);
  }
  return out;
}

export function flagsFromTaskIds(completedIds: string[], tasks: Task[]): DailyLogFlags {
  const flags: DailyLogFlags = {
    morning_done: false,
    social_done: false,
    phone_free_done: false,
    evening_done: false,
  };
  for (const id of completedIds) {
    const key = resolveLogFlagKey(id, tasks);
    if (key) flags[key] = true;
  }
  return flags;
}

export function hasAnyTaskDone(flags: DailyLogFlags): boolean {
  return flags.morning_done || flags.social_done || flags.phone_free_done || flags.evening_done;
}

export function countTasksDone(flags: DailyLogFlags): number {
  return [flags.morning_done, flags.social_done, flags.phone_free_done, flags.evening_done].filter(Boolean).length;
}

export function getFlagsForLogicalDay(
  day: string,
  anchorDate: string,
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  todayFlags: DailyLogFlags
): DailyLogFlags {
  const base = dailyLogsByDate[day] ?? {};
  const raw = day === anchorDate ? { ...base, ...todayFlags } : base;
  return {
    morning_done: Boolean(raw.morning_done),
    social_done: Boolean(raw.social_done),
    phone_free_done: Boolean(raw.phone_free_done),
    evening_done: Boolean(raw.evening_done),
  };
}

/**
 * Consecutive logical days ending at `anchorDate` with at least one task done.
 */
export function computeCurrentStreak(
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  anchorDate: string,
  todayFlags: DailyLogFlags
): number {
  let streak = 0;
  let d = anchorDate;
  for (;;) {
    const f = getFlagsForLogicalDay(d, anchorDate, dailyLogsByDate, todayFlags);
    if (!hasAnyTaskDone(f)) break;
    streak += 1;
    d = addLogicalDays(d, -1);
  }
  return streak;
}

/** Days in the last 7 logical days (inclusive) with ≥1 task completed. */
export function computeWeeklyActiveDays(
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  anchorDate: string,
  todayFlags: DailyLogFlags
): number {
  const range = getLogicalDateRange(anchorDate, 7);
  let n = 0;
  for (const day of range) {
    const f = getFlagsForLogicalDay(day, anchorDate, dailyLogsByDate, todayFlags);
    if (hasAnyTaskDone(f)) n += 1;
  }
  return n;
}

export function formatWeeklyAverageLabel(activeDaysOutOf7: number): string {
  return `${activeDaysOutOf7}/7 Days`;
}

export { getLogicalDateString, getLogicalDateRange, addLogicalDays };
