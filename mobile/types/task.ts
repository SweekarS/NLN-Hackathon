export type InteractionType = 'timer' | 'photo_upload' | 'simple_check';

/**
 * Daily ritual task. Stored in Zustand `tasks` and synced to Supabase `profiles.tasks_json`.
 * Rich fields come from Gemini onboarding; legacy tasks omit `interaction_type` and default to `simple_check`.
 */
export interface Task {
  id: string;
  /** Ionicons glyph name for display (fallback). */
  icon: string;
  /** Semantic icon hint from Gemini (e.g. sun, leaf, chat). See `resolveTaskIonicon`. */
  icon_type?: string;
  title: string;
  subtitle: string;
  /** Display label e.g. "15M" — may be derived from `duration_minutes`. */
  duration?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  enabled: boolean;
  interaction_type?: InteractionType;
  /** Required when `interaction_type === 'timer'`. */
  duration_minutes?: number;
  /** From Gemini JSON; daily completion is tracked in `todayCompletions` in the store. */
  completed?: boolean;
}

/** Alias for documentation — `tasks` in the store holds this shape. */
export type CustomTask = Task;
