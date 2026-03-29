import type { Task, InteractionType } from '../types/task';

const INTERACTION_TYPES: InteractionType[] = ['timer', 'photo_upload', 'simple_check'];

export function isInteractionType(s: string): s is InteractionType {
  return INTERACTION_TYPES.includes(s as InteractionType);
}

/** Ensures legacy tasks without new fields still work. Keeps `duration` in sync with `duration_minutes` for timers. */
export function normalizeTask(partial: Task): Task {
  const interaction_type: InteractionType =
    partial.interaction_type && isInteractionType(partial.interaction_type)
      ? partial.interaction_type
      : 'simple_check';
  let duration_minutes = partial.duration_minutes;
  if (interaction_type === 'timer' && (duration_minutes == null || duration_minutes < 1)) {
    duration_minutes = 10;
  }
  if (interaction_type !== 'timer') {
    duration_minutes = undefined;
  }
  const duration =
    interaction_type === 'timer' && duration_minutes != null && duration_minutes >= 1
      ? formatDurationMinutesLabel(duration_minutes)
      : undefined;
  return {
    ...partial,
    interaction_type,
    duration_minutes,
    duration,
    completed: partial.completed ?? false,
  };
}

export function formatDurationMinutesLabel(min?: number): string | undefined {
  if (min == null || min < 1) return undefined;
  return `${Math.round(min)}M`;
}

const BREATH_RE = /breath|breathe|meditat|mindful|ground|4-7-8|pranayama|calm|center/i;

/**
 * Clamp timer lengths to realistic ranges: breathing/morning micro-practices 3–5 min;
 * focus blocks 10–45 min; other timers 5–30 min.
 */
export function applySensibleTimerDurations(tasks: Task[]): Task[] {
  return tasks.map((t) => {
    if (t.interaction_type !== 'timer' || t.duration_minutes == null) return t;
    let m = Math.round(Number(t.duration_minutes));
    if (!Number.isFinite(m) || m < 1) m = 5;

    const blob = `${t.title} ${t.subtitle}`.toLowerCase();
    const breathLike = BREATH_RE.test(blob) || t.id === 'morning';

    if (breathLike) {
      m = Math.min(5, Math.max(3, m));
    } else if (t.id === 'focus') {
      m = Math.min(45, Math.max(10, m));
    } else if (t.id === 'evening') {
      m = Math.min(25, Math.max(5, m));
    } else {
      m = Math.min(30, Math.max(5, m));
    }

    return normalizeTask({
      ...t,
      duration_minutes: m,
      duration: formatDurationMinutesLabel(m),
    });
  });
}

