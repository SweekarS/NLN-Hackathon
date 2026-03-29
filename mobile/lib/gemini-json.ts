/** Gemini may return a bare array or an object wrapper when using JSON mode. */
export function extractJsonArray(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    for (const key of ['tasks', 'rituals', 'items', 'data', 'daily_tasks']) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return null;
}
