import type { Task, InteractionType } from '../types/task';

const INTERACTION_TYPES: InteractionType[] = ['timer', 'photo_upload', 'simple_check'];

export function isInteractionType(s: string): s is InteractionType {
  return INTERACTION_TYPES.includes(s as InteractionType);
}

function parseMinutesFromDurationLabel(s?: string): number | undefined {
  if (!s || typeof s !== 'string') return undefined;
  const m = s.trim().match(/^(\d+)\s*M$/i);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

/**
 * Guess timer vs photo from title/subtitle when `interaction_type` is missing (custom tasks, legacy data).
 * Exercise / meditation / focus → timer. Meeting someone / eating out / outings → photo.
 */
export function inferInteractionFromContent(partial: Task): InteractionType | null {
  const blob = `${partial.title} ${partial.subtitle}`.toLowerCase();
  const timerHit =
    /\b(workout|exercise|gym|yoga|pilates|hiit|cardio|run\b|running|jog|jogging|meditat|meditation|breath|breathing|pranayama|stretch|stretches|plank|squat|rep\b|reps|lift|lifting|pomodoro|focus block|deep work|study block|jump rope|cycle\b|cycling|swim|swimming)\b/i.test(
      blob,
    );
  const photoHit =
    /\b(meet|meeting|coffee|lunch|brunch|dinner|eat|eating|restaurant|cafe|bistro|friend|friends|family|date|party|hangout|picnic|outing|grab a bite|someone|together|networking|colleague|go out|dining|outdoor meal|nature walk|walk with|stroll with|meal with)\b/i.test(
      blob,
    );
  if (timerHit && photoHit) {
    const exerciseFirst =
      /\b(workout|exercise|gym|yoga|run\b|meditat|breath|hiit|plank|jog|swim|cycle)\b/i.test(
        blob,
      );
    return exerciseFirst ? 'timer' : 'photo_upload';
  }
  if (timerHit) return 'timer';
  if (photoHit) return 'photo_upload';
  return null;
}

/**
 * Resolves interaction type when missing or invalid — matches onboarding/Gemini design:
 * morning + focus → timer, social → photo, evening → quick check; also timer if duration is set.
 * Optional `listIndex` (0–3) maps the first four list slots when ids are custom (timer / photo / timer / check).
 */
export function inferInteractionType(partial: Task, listIndex?: number): InteractionType {
  if (partial.interaction_type && isInteractionType(partial.interaction_type)) {
    return partial.interaction_type;
  }
  switch (partial.id) {
    case 'morning':
      return 'timer';
    case 'social':
      return 'photo_upload';
    case 'focus':
      return 'timer';
    case 'evening':
      return 'simple_check';
    default:
      break;
  }
  const fromContent = inferInteractionFromContent(partial);
  if (fromContent) return fromContent;
  if (
    listIndex != null &&
    listIndex >= 0 &&
    listIndex < 4
  ) {
    const bySlot: InteractionType[] = [
      'timer',
      'photo_upload',
      'timer',
      'simple_check',
    ];
    return bySlot[listIndex]!;
  }
  if (typeof partial.duration_minutes === 'number' && partial.duration_minutes >= 1) {
    return 'timer';
  }
  if (parseMinutesFromDurationLabel(partial.duration) != null) {
    return 'timer';
  }
  return 'simple_check';
}

/** Ensures legacy tasks without new fields still work. Keeps `duration` in sync with `duration_minutes` for timers. */
export function normalizeTask(partial: Task, listIndex?: number): Task {
  const interaction_type = inferInteractionType(partial, listIndex);
  let duration_minutes = partial.duration_minutes;
  if (
    interaction_type === 'timer' &&
    (duration_minutes == null || duration_minutes < 1)
  ) {
    duration_minutes = parseMinutesFromDurationLabel(partial.duration) ?? 10;
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
  return tasks.map((t, i) => {
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

    return normalizeTask(
      {
        ...t,
        duration_minutes: m,
        duration: formatDurationMinutesLabel(m),
      },
      i,
    );
  });
}

