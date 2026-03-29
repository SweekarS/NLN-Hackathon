import type { Task } from '../types/task';
import {
  addLogicalDays,
  getLogicalDateRange,
  getLogicalDateString,
} from './logical-date';

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
export function getGrowthTierTitle(
  level: number,
): 'Seeker' | 'Explorer' | 'Architect' | 'Sanctuary Master' {
  if (level >= 31) return 'Sanctuary Master';
  if (level >= 16) return 'Architect';
  if (level >= 6) return 'Explorer';
  return 'Seeker';
}

/** XP progress within the current level (0–499) toward the next level. */
export function xpProgressInCurrentLevel(totalXP: number): {
  intoLevel: number;
  levelFloor: number;
  nextLevelTotal: number;
} {
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

/**
 * Map task id → daily_logs column. Known ids first; else first four **positions** in the
 * task list (0–3) map to morning/social/phone/evening so completions work with any list length.
 * Tasks beyond index 3 have no Supabase flag (still tracked in `todayCompletions`).
 */
export function resolveLogFlagKey(
  taskId: string,
  tasks: Task[],
): keyof DailyLogFlags | null {
  const direct = taskIdToLogFlagKey(taskId);
  if (direct) return direct;
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx >= 0 && idx < 4) {
    const bySlot: (keyof DailyLogFlags)[] = [
      'morning_done',
      'social_done',
      'phone_free_done',
      'evening_done',
    ];
    return bySlot[idx]!;
  }
  return null;
}

/** Which tasks are done today, from boolean flags + current task list. */
export function completionIdsFromFlags(
  flags: DailyLogFlags,
  tasks: Task[],
): string[] {
  const out: string[] = [];
  for (const t of tasks) {
    const key = resolveLogFlagKey(t.id, tasks);
    if (key && flags[key]) out.push(t.id);
  }
  return out;
}

export function flagsFromTaskIds(
  completedIds: string[],
  tasks: Task[],
): DailyLogFlags {
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
  return (
    flags.morning_done ||
    flags.social_done ||
    flags.phone_free_done ||
    flags.evening_done
  );
}

export function countTasksDone(flags: DailyLogFlags): number {
  return [
    flags.morning_done,
    flags.social_done,
    flags.phone_free_done,
    flags.evening_done,
  ].filter(Boolean).length;
}

export function getFlagsForLogicalDay(
  day: string,
  anchorDate: string,
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  todayFlags: DailyLogFlags,
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
  todayFlags: DailyLogFlags,
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
  todayFlags: DailyLogFlags,
): number {
  const range = getLogicalDateRange(anchorDate, 7);
  let n = 0;
  for (const day of range) {
    const f = getFlagsForLogicalDay(
      day,
      anchorDate,
      dailyLogsByDate,
      todayFlags,
    );
    if (hasAnyTaskDone(f)) n += 1;
  }
  return n;
}

export function formatWeeklyAverageLabel(activeDaysOutOf7: number): string {
  return `${activeDaysOutOf7}/7 Days`;
}

/**
 * Maps completed ritual count (0–4) to Mindfulness Flow grid intensity (0–3).
 * 0 → 0, 1 → 1, 2–3 → 2, 4 → 3.
 */
export function tasksCompletedToMindfulnessIntensity(
  completed: number,
): 0 | 1 | 2 | 3 {
  if (completed <= 0) return 0;
  if (completed === 1) return 1;
  if (completed === 2 || completed === 3) return 2;
  return 3;
}

const FLOW_DAYS = 30;

/**
 * 30 sequential logical days: index 0 = 30 days ago, index 29 = `anchorDate` (today).
 * Missing days in `dailyLogsByDate` count as 0 tasks (padding at the start of a user’s history
 * is implicit—early slots are empty until logs exist).
 */
export function buildMindfulnessFlow30Day(
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  anchorDate: string,
  todayFlags?: DailyLogFlags,
): number[] {
  const dates = getLogicalDateRange(anchorDate, FLOW_DAYS);
  return dates.map((day) => {
    const base = dailyLogsByDate[day] ?? {};
    const raw =
      todayFlags && day === anchorDate ? { ...base, ...todayFlags } : base;
    const flags: DailyLogFlags = {
      morning_done: Boolean(raw.morning_done),
      social_done: Boolean(raw.social_done),
      phone_free_done: Boolean(raw.phone_free_done),
      evening_done: Boolean(raw.evening_done),
    };
    const n = countTasksDone(flags);
    return tasksCompletedToMindfulnessIntensity(n);
  });
}

/**
 * 7 sequential logical days: index 0 = 7 days ago, index 6 = `anchorDate` (today).
 * Used for the weekly heatmap view.
 */
export function buildMindfulnessFlow7Day(
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  anchorDate: string,
  todayFlags?: DailyLogFlags,
): number[] {
  const dates = getLogicalDateRange(anchorDate, 7);
  return dates.map((day) => {
    const base = dailyLogsByDate[day] ?? {};
    const raw =
      todayFlags && day === anchorDate ? { ...base, ...todayFlags } : base;
    const flags: DailyLogFlags = {
      morning_done: Boolean(raw.morning_done),
      social_done: Boolean(raw.social_done),
      phone_free_done: Boolean(raw.phone_free_done),
      evening_done: Boolean(raw.evening_done),
    };
    const n = countTasksDone(flags);
    return tasksCompletedToMindfulnessIntensity(n);
  });
}

/**
 * Finds the end date of the longest streak by scanning all historical logs.
 * Returns the logical date string (YYYY-MM-DD) when the longest streak ended.
 * If no streaks exist, returns the current date.
 */
export function computeLongestStreakEndDate(
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  anchorDate: string,
): string {
  const allDates = Object.keys(dailyLogsByDate).sort().reverse();

  if (allDates.length === 0) return anchorDate;

  let maxStreakLength = 0;
  let maxStreakEndDate = anchorDate;
  let currentStreakLength = 0;
  let currentStreakEndDate = '';

  for (const dateStr of allDates) {
    const raw = dailyLogsByDate[dateStr];
    const flags: DailyLogFlags = {
      morning_done: Boolean(raw?.morning_done),
      social_done: Boolean(raw?.social_done),
      phone_free_done: Boolean(raw?.phone_free_done),
      evening_done: Boolean(raw?.evening_done),
    };
    if (raw && hasAnyTaskDone(flags)) {
      if (currentStreakLength === 0) {
        currentStreakEndDate = dateStr;
      }
      currentStreakLength += 1;
    } else {
      if (currentStreakLength > maxStreakLength) {
        maxStreakLength = currentStreakLength;
        maxStreakEndDate = currentStreakEndDate;
      }
      currentStreakLength = 0;
      currentStreakEndDate = '';
    }
  }

  // Check if the last streak (which hasn't been broken) is the longest
  if (currentStreakLength > maxStreakLength) {
    maxStreakLength = currentStreakLength;
    maxStreakEndDate = currentStreakEndDate;
  }

  return maxStreakEndDate;
}

/**
 * Calculates the harmony score based on consistency, variety, and rest balance.
 * Returns a value between 0 and 1 (intended for display as 0-100%).
 *
 * - Consistency: % of days active in current month
 * - Variety: diversity of task types completed in current month (0-1)
 * - Rest Balance: balance of active vs rest days (peaks at 50/50)
 */
export function calculateHarmonyScore(
  dailyLogsByDate: Record<string, Partial<DailyLogFlags>>,
  anchorDate: string,
): number {
  const [year, month] = anchorDate.split('-').slice(0, 2).map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Get all dates in current month
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const dates = getLogicalDateRange(monthStart, daysInMonth);

  // Count active days and track which task types were done
  let activeDays = 0;
  const taskTypesDone = new Set<keyof DailyLogFlags>();

  for (const date of dates) {
    const log = dailyLogsByDate[date];
    if (log) {
      const flags: DailyLogFlags = {
        morning_done: Boolean(log.morning_done),
        social_done: Boolean(log.social_done),
        phone_free_done: Boolean(log.phone_free_done),
        evening_done: Boolean(log.evening_done),
      };

      if (hasAnyTaskDone(flags)) {
        activeDays += 1;
        if (flags.morning_done) taskTypesDone.add('morning_done');
        if (flags.social_done) taskTypesDone.add('social_done');
        if (flags.phone_free_done) taskTypesDone.add('phone_free_done');
        if (flags.evening_done) taskTypesDone.add('evening_done');
      }
    }
  }

  // Calculate three components
  // 1. Consistency: % of active days (0-1)
  const consistency = activeDays / daysInMonth;

  // 2. Variety: diversity of task types (0-1, where 1 = all 4 types done)
  const variety = taskTypesDone.size / 4;

  // 3. Rest Balance: balance between active and rest days (peaks at 0.5 active ratio)
  const restRatio = 1 - activeDays / daysInMonth;
  const restBalance = 1 - Math.abs(0.5 - activeDays / daysInMonth) * 2;

  // Average the three components
  const harmonyScore = (consistency + variety + restBalance) / 3;

  return Math.max(0, Math.min(1, harmonyScore));
}

export { getLogicalDateString, getLogicalDateRange, addLogicalDays };
