/**
 * Supabase client for React Native / Expo.
 * Order matters: crypto polyfill before Supabase (PKCE / session).
 */
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

type SupabaseExtra = { supabaseUrl?: string; supabaseAnonKey?: string };

/** Trim quotes, BOM, and whitespace from .env values (common copy-paste issues). */
function cleanEnv(value: string | undefined): string {
  if (value == null || value === '') return '';
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

function isPlaceholderUrl(url: string): boolean {
  const u = cleanEnv(url).toLowerCase();
  return (
    u.length === 0 ||
    u.includes('your_project_ref') ||
    u.includes('your-ref') ||
    u === 'https://placeholder.supabase.co'
  );
}

function isPlaceholderKey(key: string): boolean {
  const k = cleanEnv(key).toLowerCase();
  return k.length === 0 || k === 'your_anon_public_key_here' || k === 'your-anon-key';
}

/** Collect extra from every manifest shape Expo may use at runtime. */
function collectExtraCandidates(): SupabaseExtra[] {
  const out: SupabaseExtra[] = [];
  const ec = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  if (ec && (typeof ec.supabaseUrl === 'string' || typeof ec.supabaseAnonKey === 'string')) {
    out.push({
      supabaseUrl: typeof ec.supabaseUrl === 'string' ? ec.supabaseUrl : '',
      supabaseAnonKey: typeof ec.supabaseAnonKey === 'string' ? ec.supabaseAnonKey : '',
    });
  }
  const m1 = Constants.manifest as { extra?: Partial<SupabaseExtra> } | null;
  if (m1?.extra && (m1.extra.supabaseUrl || m1.extra.supabaseAnonKey)) {
    out.push({
      supabaseUrl: m1.extra.supabaseUrl ?? '',
      supabaseAnonKey: m1.extra.supabaseAnonKey ?? '',
    });
  }
  const m2 = Constants.manifest2 as { extra?: { expoClient?: { extra?: Partial<SupabaseExtra> } } } | null;
  const e2 = m2?.extra?.expoClient?.extra;
  if (e2 && (e2.supabaseUrl || e2.supabaseAnonKey)) {
    out.push({
      supabaseUrl: e2.supabaseUrl ?? '',
      supabaseAnonKey: e2.supabaseAnonKey ?? '',
    });
  }
  return out;
}

/**
 * Metro’s dev bundle injects EXPO_PUBLIC_* via HMR prelude; that snapshot can stay stale after you
 * edit mobile/.env. Constants.expoConfig.extra comes from app.config.js + dotenv at packager start and
 * matches the file on disk more reliably — so we try manifest extra first and never fall back to placeholders.
 */
function pickFirstUsable(
  candidates: (string | undefined)[],
  isPlaceholder: (s: string) => boolean
): string {
  for (const c of candidates) {
    const v = cleanEnv(c);
    if (v.length > 0 && !isPlaceholder(v)) return v;
  }
  return '';
}

const extraLayers = collectExtraCandidates();

const rawUrl = pickFirstUsable(
  [...extraLayers.map((e) => e.supabaseUrl), process.env.EXPO_PUBLIC_SUPABASE_URL],
  isPlaceholderUrl
);

const rawKey = pickFirstUsable(
  [...extraLayers.map((e) => e.supabaseAnonKey), process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY],
  isPlaceholderKey
);

/** Normalize project URL: no trailing slash, https scheme */
let supabaseUrl = rawUrl.replace(/\/+$/, '');
if (supabaseUrl.length > 0 && !/^https?:\/\//i.test(supabaseUrl)) {
  supabaseUrl = `https://${supabaseUrl}`;
}

function isValidHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && Boolean(u.hostname);
  } catch {
    return false;
  }
}

/** True when URL is valid https and anon key is non-empty */
export const isSupabaseConfigured = Boolean(
  rawKey.length > 0 && supabaseUrl.length > 0 && isValidHttpsUrl(supabaseUrl)
);

if (__DEV__) {
  if (!rawUrl.length || !rawKey.length) {
    console.warn(
      '[Supabase] No valid URL/key after skipping placeholders. Set real values in mobile/.env (not YOUR_PROJECT_REF), save, then stop Metro (Ctrl+C) and run: npx expo start -c'
    );
  } else if (!isValidHttpsUrl(supabaseUrl)) {
    console.warn(
      `[Supabase] Invalid EXPO_PUBLIC_SUPABASE_URL (must be https): got "${rawUrl.slice(0, 48)}…"`
    );
  } else {
    try {
      console.log('[Supabase] Using host', new URL(supabaseUrl).hostname);
    } catch {
      /* ignore */
    }
  }
}

export const supabase = createClient(supabaseUrl, rawKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    /** PKCE is required for signInWithOAuth + exchangeCodeForSession (e.g. Google) on native. */
    flowType: 'pkce',
  },
});

/** Project ref from EXPO_PUBLIC URL, for dashboard deep links (e.g. Auth settings). */
export function getSupabaseProjectRef(): string | null {
  if (!isValidHttpsUrl(supabaseUrl)) return null;
  try {
    const host = new URL(supabaseUrl).hostname;
    if (!host.endsWith('.supabase.co')) return null;
    return host.replace(/\.supabase\.co$/i, '');
  } catch {
    return null;
  }
}

/** Open in browser: Email provider (turn off Confirm email for dev) or rate limits. */
export function supabaseDashboardAuthUrl(
  page: 'providers' | 'rate-limits'
): string | null {
  const ref = getSupabaseProjectRef();
  if (!ref) return null;
  return `https://supabase.com/dashboard/project/${ref}/auth/${page}`;
}
