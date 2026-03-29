import Ionicons from '@expo/vector-icons/Ionicons';
import type { Task } from '../types/task';

type GlyphName = keyof typeof Ionicons.glyphMap;

/** Map Gemini `icon_type` hints to Ionicons names (also accepts full ionicon names). */
const ICON_TYPE_MAP: Record<string, GlyphName> = {
  sun: 'sunny-outline',
  sunny: 'sunny-outline',
  drop: 'water-outline',
  water: 'water-outline',
  rain: 'rainy-outline',
  book: 'book-outline',
  leaf: 'leaf-outline',
  chat: 'chatbubbles-outline',
  social: 'people-outline',
  people: 'people-outline',
  moon: 'moon-outline',
  night: 'moon-outline',
  phone: 'phone-portrait-outline',
  focus: 'phone-portrait-outline',
  heart: 'heart-outline',
  fitness: 'fitness-outline',
  flame: 'flame-outline',
  music: 'musical-notes-outline',
  cafe: 'cafe-outline',
  walk: 'walk-outline',
  meditation: 'flower-outline',
  breathe: 'leaf-outline',
};

export function resolveTaskIonicon(task: Task): GlyphName {
  const raw = (task.icon_type || '').toLowerCase().trim();
  if (raw && ICON_TYPE_MAP[raw]) {
    return ICON_TYPE_MAP[raw]!;
  }
  if (task.icon && typeof task.icon === 'string' && task.icon.includes('-')) {
    return task.icon as GlyphName;
  }
  return 'leaf-outline';
}
