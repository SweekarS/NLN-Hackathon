import { supabase, isSupabaseConfigured } from './supabase';
import { updateProfileTasksJsonRemote } from './sync-dashboard-stats';
import type { Task } from '../types/task';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 600;

/**
 * Debounced sync of ritual definitions to `profiles.tasks_json` (timer/photo/check types, titles, etc.).
 * Call after local task mutations when the user may be logged in.
 */
export function scheduleProfileTasksJsonSync(getTasks: () => Task[]): void {
  if (!isSupabaseConfigured) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushProfileTasksJson(getTasks);
  }, DEBOUNCE_MS);
}

/** Immediate sync; clears pending debounce. Use from Customize "Save" or before sign-out. */
export async function flushProfileTasksJsonSync(getTasks: () => Task[]): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  await pushProfileTasksJson(getTasks);
}

async function pushProfileTasksJson(getTasks: () => Task[]): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const tasks = getTasks();
    const { error } = await updateProfileTasksJsonRemote(uid, tasks);
    if (error && __DEV__) {
      console.warn('[tasks_json sync]', error.message);
    }
  } catch (e) {
    if (__DEV__) console.warn('[tasks_json sync]', e);
  }
}
