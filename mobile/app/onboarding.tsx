import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  UIManager,
  Alert,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/ui/Button';
import { FieldInput } from '../components/ui/FieldInput';
import { FieldLabel } from '../components/ui/FieldLabel';
import { Logo } from '../components/ui/Logo';
import {
  useAppStore,
  type OnboardingDraft,
  type Task,
  FALLBACK_GEMINI_TASKS,
  mapGeminiJsonToTasks,
} from '../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { IconCircle } from '../components/ui/IconCircle';
import { colors, fonts, spacing, radii, shadow } from '../theme';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveOnboardingCompleteToProfile } from '../lib/sync-dashboard-stats';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Local dark palette for quiz + loading (welcome stays light theme). */
const ob = {
  bg: '#0B1410',
  card: '#15251C',
  cardBorder: '#243A2E',
  text: '#F4F7F5',
  muted: '#9CA89E',
  accent: '#7CB89A',
  accentSoft: '#1E3D2E',
  progressTrack: '#243A2E',
  progressFill: '#5FA882',
  iconBg: '#1E3328',
  iconColor: '#BFEECC',
};

const LOADING_PHRASES = [
  'Analyzing preferences...',
  'Building custom routines...',
  'Setting up your digital space...',
] as const;

const journeyOptions = [
  { key: 'solo' as const, iconName: 'body-outline' as const, title: 'Solo Journey', desc: 'Private self-tracking with no social requirement.' },
  { key: 'friend' as const, iconName: 'people-outline' as const, title: 'Friend Mode', desc: 'Optional sharing with trusted people only.' },
  { key: 'anonymous' as const, iconName: 'globe-outline' as const, title: 'Anonymous Community', desc: 'Minimal identity and community support.' },
];

type QuizOption = { id: 1 | 2 | 3; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap };

const MORNING_OPTIONS: QuizOption[] = [
  { id: 1, title: 'Gentle movement', subtitle: 'Stretch or light mobility to wake your body.', icon: 'body-outline' },
  { id: 2, title: 'Mindful breath', subtitle: 'A few minutes of calm, centered breathing.', icon: 'leaf-outline' },
  { id: 3, title: 'Creative spark', subtitle: 'Journaling, music, or something that inspires you.', icon: 'color-palette-outline' },
];

const SOCIAL_OPTIONS: QuizOption[] = [
  { id: 1, title: 'Deep one-to-one', subtitle: 'Quality time with someone you trust.', icon: 'heart-outline' },
  { id: 2, title: 'Light group energy', subtitle: 'Casual chats or shared activities.', icon: 'chatbubbles-outline' },
  { id: 3, title: 'Solo with optional touch-in', subtitle: 'Mostly alone, with gentle connection when you want it.', icon: 'person-outline' },
];

const RECHARGE_OPTIONS: QuizOption[] = [
  { id: 1, title: 'Nature & outdoors', subtitle: 'Air, light, and green space.', icon: 'leaf-outline' },
  { id: 2, title: 'Quiet indoor calm', subtitle: 'Low stimulation and cozy stillness.', icon: 'home-outline' },
  { id: 3, title: 'Music or movement', subtitle: 'Rhythm, dance, or sound to reset.', icon: 'musical-notes-outline' },
];

function phaseFromParams(params: { phase?: string | string[] }): string | undefined {
  const p = params.phase;
  return Array.isArray(p) ? p[0] : p;
}

function resolveGeminiApiKey(): string {
  const fromEnv = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const extra = Constants.expoConfig?.extra as { geminiApiKey?: string } | undefined;
  return (typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : extra?.geminiApiKey) ?? '';
}

function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/s, '');
  }
  return t.trim();
}

function isValidDob(s: string): boolean {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return false;
  const mm = parseInt(m[1], 10);
  const dd = parseInt(m[2], 10);
  const yyyy = parseInt(m[3], 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > 2100) return false;
  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

function isValidGeminiTaskArray(tasks: Task[]): boolean {
  if (tasks.length !== 4) return false;
  const ids = new Set(tasks.map((t) => t.id));
  return ids.has('morning') && ids.has('social') && ids.has('focus') && ids.has('evening');
}

function optionLabel(options: QuizOption[], choice: 1 | 2 | 3 | null | undefined): string {
  if (choice == null) return 'Not specified';
  const o = options.find((x) => x.id === choice);
  return o ? `${o.title} (${o.subtitle})` : String(choice);
}

/** Human-readable block inserted into the Gemini prompt so the model uses real quiz answers. */
function formatDraftForGemini(draft: OnboardingDraft): string {
  return [
    `First name: ${draft.firstName.trim() || 'Friend'}`,
    `Date of birth (MM/DD/YYYY): ${draft.dateOfBirth.trim() || 'unknown'}`,
    `Morning kickstart: ${optionLabel(MORNING_OPTIONS, draft.morningKickstart)}`,
    `Staying connected: ${optionLabel(SOCIAL_OPTIONS, draft.socialConnection)}`,
    `Recharging: ${optionLabel(RECHARGE_OPTIONS, draft.recharge)}`,
  ].join('\n');
}

/**
 * System context for Gemini — defines the app so tasks are on-brand and truly personalized,
 * not generic wellness filler.
 */
const GEMINI_SYSTEM_PROMPT = [
  'You are the ritual designer for **The Organic Sanctuary**, a mobile wellness app.',
  '',
  'What the app is:',
  '- A calm, nature-inspired daily companion: small, doable rituals (not overwhelming productivity hacks).',
  '- Themes: organic living, mindful pacing, nervous-system-friendly habits, gentle connection with self and others.',
  '- Users track simple daily tasks across the day: morning grounding, social check-ins, focused screen-free time, and evening wind-down.',
  '- Tone: warm, non-judgmental, specific—never clinical, corporate, or toxic-positivity.',
  '',
  'Your job when given a user profile:',
  '- Invent **custom titles and descriptions** that clearly reflect **their** morning, social, and recharge preferences.',
  '- Do **not** output boilerplate text. Mention concrete behaviors implied by their choices (e.g. breath vs movement vs creative; 1:1 vs group vs solo; nature vs quiet indoor vs music).',
  '- Keep each description under ~120 characters, actionable and kind.',
  '- The four fixed task slots are: morning (start the day), social (connection), focus (phone/screen boundaries or deep rest as fits), evening (close the day). Map the user’s “recharge” and other answers into the best slot; evening wind-down should echo how they recharge.',
  '',
  'Output rules (critical):',
  '- Respond with **only** valid JSON: a single array of exactly 4 objects.',
  '- No markdown, no code fences, no commentary before or after the array.',
  '- Each object: id (string), title (string), description (string), completed (boolean, always false).',
  '- Required ids in order: "morning", "social", "focus", "evening".',
].join('\n');

/** User turn: quiz data + strict JSON shape reminder. */
function buildGeminiUserPrompt(draft: OnboardingDraft): string {
  const answers = formatDraftForGemini(draft);
  return [
    'Here is this user’s onboarding profile. Generate their four daily tasks.',
    '',
    'Profile:',
    answers,
    '',
    'Return ONLY a raw JSON array (no markdown) in this shape (replace titles/descriptions with personalized copy):',
    '[',
    '  { "id": "morning", "title": "...", "description": "...", "completed": false },',
    '  { "id": "social", "title": "...", "description": "...", "completed": false },',
    '  { "id": "focus", "title": "...", "description": "...", "completed": false },',
    '  { "id": "evening", "title": "...", "description": "...", "completed": false }',
    ']',
  ].join('\n');
}

/** Random duration between min and max ms (inclusive). */
function randomMs(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'] as const;

async function tryGenerateWithModel(
  model: string,
  userPrompt: string,
  apiKey: string,
  signal: AbortSignal
): Promise<Task[] | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 2048 },
    }),
    signal,
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.length) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(text));
  } catch {
    return null;
  }

  const mapped = mapGeminiJsonToTasks(parsed);
  if (!mapped || !isValidGeminiTaskArray(mapped)) return null;
  return mapped;
}

async function fetchGeminiTasks(draft: OnboardingDraft, apiKey: string): Promise<Task[]> {
  const fallback = FALLBACK_GEMINI_TASKS.map((t) => ({ ...t }));
  if (!apiKey) return fallback;

  const userPrompt = buildGeminiUserPrompt(draft);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    for (const model of GEMINI_MODELS) {
      if (controller.signal.aborted) break;
      try {
        const tasks = await tryGenerateWithModel(model, userPrompt, apiKey, controller.signal);
        if (tasks) return tasks;
      } catch {
        /* try next model */
      }
    }
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

function QuizOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: QuizOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        obStyles.optionRow,
        selected && obStyles.optionRowSelected,
        { opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <IconCircle name={option.icon} size="lg" color={ob.accent} bg={ob.iconBg} />
      <View style={{ flex: 1 }}>
        <Text style={obStyles.optionTitle}>{option.title}</Text>
        <Text style={obStyles.optionSubtitle}>{option.subtitle}</Text>
      </View>
      {selected ? (
        <View style={obStyles.checkBadge}>
          <Ionicons name="checkmark" size={16} color={ob.bg} />
        </View>
      ) : null}
    </Pressable>
  );
}

/** Step 5 — light mint “Organic Sanctuary” loading (reference image 5): gradient, header, pulse logo, floating accents. */
function Step5SanctuaryLoading({ phraseIndex }: { phraseIndex: number }) {
  const scale = useSharedValue(1);
  const drift = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    drift2.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    spin.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
  }, [scale, drift, drift2, spin]);

  const logoAnimated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const leafFloater = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(drift.value, [0, 1], [4, -14]) },
      { rotate: `${interpolate(drift.value, [0, 1], [-6, 6])}deg` },
    ],
    opacity: interpolate(drift.value, [0, 1], [0.4, 0.95]),
  }));

  const flowerFloater = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(drift2.value, [0, 1], [-6, 10]) },
      { rotate: `${interpolate(drift2.value, [0, 1], [8, -4])}deg` },
    ],
    opacity: interpolate(drift2.value, [0, 1], [0.35, 0.9]),
  }));

  const slowRotate = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const cycle = LOADING_PHRASES[phraseIndex % LOADING_PHRASES.length];

  return (
    <View style={loading5.container}>
      <View style={loading5.topRow}>
        <Text style={loading5.brandTitle}>The Organic Sanctuary</Text>
        <Text style={loading5.stepCaps}>STEP 5 OF 5</Text>
      </View>
      <View style={loading5.progressTrack}>
        <View style={loading5.progressFill} />
      </View>

      <View style={loading5.heroWrap}>
        <Animated.View style={[loading5.decoLeaf, leafFloater]} pointerEvents="none">
          <Ionicons name="leaf-outline" size={28} color="#1B4D3E" />
        </Animated.View>
        <Animated.View style={[loading5.decoFlower, flowerFloater]} pointerEvents="none">
          <Ionicons name="flower-outline" size={26} color="#2E7D5B" />
        </Animated.View>

        <Animated.View style={[loading5.ring, slowRotate]} pointerEvents="none" />
        <Animated.View style={[logoAnimated, { alignItems: 'center', justifyContent: 'center' }]}>
          <Logo size={148} />
        </Animated.View>
      </View>

      <Text style={loading5.mainLine}>
        Almost there. We are tailoring the sanctuary to match your unique rhythm.
      </Text>
      <Text style={loading5.cycleLine}>{cycle}</Text>

      <LinearGradient
        colors={['transparent', 'rgba(200, 230, 217, 0.45)', '#B8D9C8']}
        locations={[0, 0.45, 1]}
        style={loading5.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const loading5 = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brandTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: fonts.headlineExtraBold,
    color: '#1B4D3E',
    letterSpacing: -0.3,
  },
  stepCaps: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: '#6B7280',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  progressTrack: {
    height: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(27, 77, 62, 0.12)',
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1B4D3E',
    borderRadius: 6,
  },
  heroWrap: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  decoLeaf: {
    position: 'absolute',
    top: '12%',
    right: '8%',
  },
  decoFlower: {
    position: 'absolute',
    bottom: '18%',
    left: '10%',
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 91, 0.2)',
  },
  mainLine: {
    fontSize: 17,
    fontFamily: fonts.bodyMedium,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  cycleLine: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: '#096444',
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
});

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phase?: string | string[] }>();
  const phaseParam = phaseFromParams(params);

  const journeyMode = useAppStore((s) => s.journeyMode);
  const setJourneyMode = useAppStore((s) => s.setJourneyMode);
  const onboardingDraft = useAppStore((s) => s.onboardingDraft);
  const setOnboardingDraft = useAppStore((s) => s.setOnboardingDraft);
  const clearOnboardingDraft = useAppStore((s) => s.clearOnboardingDraft);
  const updateTasks = useAppStore((s) => s.updateTasks);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const [welcomeStep, setWelcomeStep] = useState<'intro' | 'journey'>('intro');
  /** Welcome (intro/journey) vs quiz (steps 1–5). */
  const [mainFlow, setMainFlow] = useState<'welcome' | 'quiz'>(() =>
    phaseFromParams(params) === 'quiz' ? 'quiz' : 'welcome'
  );
  const [quizStep, setQuizStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showLoginFields, setShowLoginFields] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (phaseParam === 'quiz') {
      setMainFlow('quiz');
      setQuizStep(1);
    }
  }, [phaseParam]);

  const remoteProfileReady = useAppStore((s) => s._remoteProfileReady);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  useEffect(() => {
    if (!remoteProfileReady || !hasCompletedOnboarding) return;
    router.replace('/(tabs)');
  }, [remoteProfileReady, hasCompletedOnboarding]);

  useEffect(() => {
    if (mainFlow === 'quiz' && quizStep === 5) {
      const id = setInterval(() => {
        setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length);
      }, 1500);
      return () => clearInterval(id);
    }
  }, [mainFlow, quizStep]);

  useEffect(() => {
    if (mainFlow !== 'quiz' || quizStep !== 5) return;

    let cancelled = false;
    (async () => {
      const minLoadingMs = randomMs(3000, 5000);
      const startedAt = Date.now();
      const draft = useAppStore.getState().onboardingDraft;
      const key = resolveGeminiApiKey();
      const tasks = await fetchGeminiTasks(draft, key);
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minLoadingMs - elapsed);
      if (remaining > 0) await sleep(remaining);
      if (cancelled) return;
      updateTasks(tasks);
      useAppStore.setState({ todayCompletions: [] });
      clearOnboardingDraft();
      setOnboardingComplete();

      if (isSupabaseConfigured) {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (uid) {
          const st = useAppStore.getState();
          await saveOnboardingCompleteToProfile(uid, {
            tasks,
            total_xp: st.totalXP,
            current_streak: st.currentStreak,
          });
        }
      }

      router.replace('/(tabs)');
    })();

    return () => {
      cancelled = true;
    };
  }, [mainFlow, quizStep, updateTasks, clearOnboardingDraft, setOnboardingComplete]);

  const setUserName = useAppStore((s) => s.setUserName);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert('Configuration Error', 'Supabase is not configured.');
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        Alert.alert('Sign in failed', error.message);
        return;
      }

      if (data.user) {
        const metaName = data.user.user_metadata?.name || data.user.user_metadata?.full_name;
        const displayName = metaName || trimmedEmail.split('@')[0];
        setUserName(displayName);
        await useAppStore.getState().refreshDashboardStatsFromRemote(data.user.id);
        if (useAppStore.getState().hasCompletedOnboarding) {
          router.replace('/(tabs)');
        } else {
          setMainFlow('quiz');
          setQuizStep(1);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const step1Valid =
    onboardingDraft.firstName.trim().length > 0 && isValidDob(onboardingDraft.dateOfBirth);
  const step2Valid = onboardingDraft.morningKickstart != null;
  const step3Valid = onboardingDraft.socialConnection != null;
  const step4Valid = onboardingDraft.recharge != null;

  const quizProgress = quizStep <= 4 ? quizStep / 5 : 1;

  const quizHeader = (
    <View style={obStyles.quizHeader}>
      <Text style={obStyles.brandLine}>The Organic Sanctuary</Text>
      {quizStep < 5 ? (
        <Text style={obStyles.stepOf}>Step {quizStep} of 5</Text>
      ) : (
        <Text style={obStyles.stepOf}>Almost there</Text>
      )}
      <View style={obStyles.progressTrack}>
        <View style={[obStyles.progressFill, { width: `${Math.round(quizProgress * 100)}%` }]} />
      </View>
    </View>
  );

  const quizBody = (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        contentContainerStyle={[obStyles.scroll, { paddingBottom: insets.bottom + spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {quizHeader}

        {quizStep === 1 && (
          <Animated.View entering={FadeIn.duration(350)} style={obStyles.card}>
            <Text style={obStyles.cardTitle}>Let’s get to know you</Text>
            <Text style={obStyles.cardHint}>We’ll use this to shape gentle, realistic routines.</Text>

            <View style={{ marginBottom: spacing.md }}>
              <Text style={obStyles.fieldLabel}>First name</Text>
              <TextInput
                value={onboardingDraft.firstName}
                onChangeText={(t) => setOnboardingDraft({ firstName: t })}
                placeholder="Your first name"
                placeholderTextColor={ob.muted}
                style={obStyles.textInput}
                allowFontScaling
              />
            </View>

            <View style={{ marginBottom: spacing.lg }}>
              <Text style={obStyles.fieldLabel}>Date of birth</Text>
              <TextInput
                value={onboardingDraft.dateOfBirth}
                onChangeText={(t) => setOnboardingDraft({ dateOfBirth: t })}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={ob.muted}
                style={obStyles.textInput}
                keyboardType="numbers-and-punctuation"
                allowFontScaling
              />
            </View>

            <Button
              title="Continue"
              onPress={() => setQuizStep(2)}
              disabled={!step1Valid}
              style={!step1Valid ? { opacity: 0.5 } : undefined}
            />
          </Animated.View>
        )}

        {quizStep === 2 && (
          <Animated.View entering={FadeIn.duration(350)} style={obStyles.card}>
            <Text style={obStyles.cardTitle}>How do you like to start your morning?</Text>
            <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
              {MORNING_OPTIONS.map((opt) => (
                <QuizOptionRow
                  key={opt.id}
                  option={opt}
                  selected={onboardingDraft.morningKickstart === opt.id}
                  onSelect={() => setOnboardingDraft({ morningKickstart: opt.id })}
                />
              ))}
            </View>
            <View style={obStyles.rowButtons}>
              <Button title="Back" variant="ghost" onPress={() => setQuizStep(1)} textStyle={{ color: ob.text }} />
              <View style={{ flex: 1 }}>
                <Button title="Continue" onPress={() => setQuizStep(3)} disabled={!step2Valid} />
              </View>
            </View>
          </Animated.View>
        )}

        {quizStep === 3 && (
          <Animated.View entering={FadeIn.duration(350)} style={obStyles.card}>
            <Text style={obStyles.cardTitle}>What kind of connection nourishes you?</Text>
            <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
              {SOCIAL_OPTIONS.map((opt) => (
                <QuizOptionRow
                  key={opt.id}
                  option={opt}
                  selected={onboardingDraft.socialConnection === opt.id}
                  onSelect={() => setOnboardingDraft({ socialConnection: opt.id })}
                />
              ))}
            </View>
            <View style={obStyles.rowButtons}>
              <Button title="Back" variant="ghost" onPress={() => setQuizStep(2)} textStyle={{ color: ob.text }} />
              <View style={{ flex: 1 }}>
                <Button title="Continue" onPress={() => setQuizStep(4)} disabled={!step3Valid} />
              </View>
            </View>
          </Animated.View>
        )}

        {quizStep === 4 && (
          <Animated.View entering={FadeIn.duration(350)} style={obStyles.card}>
            <Text style={obStyles.cardTitle}>How do you recharge best?</Text>
            <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
              {RECHARGE_OPTIONS.map((opt) => (
                <QuizOptionRow
                  key={opt.id}
                  option={opt}
                  selected={onboardingDraft.recharge === opt.id}
                  onSelect={() => setOnboardingDraft({ recharge: opt.id })}
                />
              ))}
            </View>
            <View style={obStyles.rowButtons}>
              <Button title="Back" variant="ghost" onPress={() => setQuizStep(3)} textStyle={{ color: ob.text }} />
              <View style={{ flex: 1 }}>
                <Button
                  title="Continue"
                  onPress={() => setQuizStep(5)}
                  disabled={!step4Valid}
                />
              </View>
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (mainFlow === 'quiz' && quizStep === 5) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F4FAF6' }}>
        <LinearGradient
          colors={['#F4FAF6', '#E8F5EE', '#DCEFE4']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <Step5SanctuaryLoading phraseIndex={phraseIndex} />
        </SafeAreaView>
      </View>
    );
  }

  if (mainFlow === 'quiz') {
    return (
      <SafeAreaView style={obStyles.safe} edges={['top', 'bottom']}>
        {quizBody}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {welcomeStep === 'intro' && (
            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={{ flex: 1 }}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: showLoginFields ? 200 : 400,
                }}
              >
                <Animated.View entering={FadeInUp.duration(600).delay(50)}>
                  <Logo size={160} />
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(700).delay(150)}>
                  <Text
                    style={{
                      marginTop: spacing['2xl'],
                      fontSize: 24,
                      fontFamily: fonts.headlineExtraBold,
                      color: colors.primary,
                      textAlign: 'center',
                      paddingHorizontal: spacing.lg,
                      lineHeight: 32,
                    }}
                  >
                    The Organic Sanctuary
                  </Text>
                </Animated.View>
              </View>

              <Animated.View layout={LinearTransition.duration(600)} style={{ marginTop: 'auto', paddingTop: spacing.xl }}>
                {!showLoginFields ? (
                  <Animated.View key="buttons" entering={FadeIn.duration(500).delay(200)} exiting={FadeOut.duration(300)} style={styles.buttonWrap}>
                    <Button title="Sign Up" onPress={() => setWelcomeStep('journey')} />
                    <Button title="Sign In" variant="ghost" onPress={() => setShowLoginFields(true)} />
                  </Animated.View>
                ) : (
                  <Animated.View key="fields" entering={FadeInUp.duration(600).delay(250)} exiting={FadeOut.duration(300)}>
                    <View style={{ marginBottom: spacing.md }}>
                      <FieldLabel label="Email" />
                      <FieldInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={{ marginBottom: spacing.xl }}>
                      <FieldLabel label="Password" />
                      <FieldInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                      />
                    </View>

                    <View style={styles.buttonWrap}>
                      <Button title={authLoading ? 'Signing in...' : 'Login'} onPress={handleLogin} disabled={authLoading} />
                      <Button title="Back" variant="ghost" onPress={() => setShowLoginFields(false)} disabled={authLoading} />
                    </View>
                  </Animated.View>
                )}
              </Animated.View>
            </Animated.View>
          )}

          {welcomeStep === 'journey' && (
            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(400)} style={{ flex: 1 }}>
              <Animated.View entering={FadeInUp.duration(500).delay(100)} style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.stepLabel}>Step 1 of 2</Text>
                <Text style={styles.sectionTitle}>Choose Your Journey</Text>

                <View style={styles.journeyWrap}>
                  {journeyOptions.map((opt) => {
                    const selected = journeyMode === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => setJourneyMode(opt.key)}
                        style={[styles.journeyCard, selected && styles.journeyCardSelected]}
                      >
                        <IconCircle name={opt.iconName} size="md" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.journeyTitle}>{opt.title}</Text>
                          <Text style={styles.journeyDesc}>{opt.desc}</Text>
                        </View>
                        {selected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={14} color={colors.white} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>

              <View style={[styles.buttonWrap, { marginTop: 'auto', paddingTop: spacing.xl }]}>
                <Button title="Start My Journey" onPress={() => router.push('/account-privacy')} />
                <Button title="Back" variant="ghost" onPress={() => setWelcomeStep('intro')} />
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const obStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ob.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  quizHeader: {
    marginBottom: spacing.xl,
  },
  brandLine: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: ob.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  stepOf: {
    fontSize: 18,
    fontFamily: fonts.headlineBold,
    color: ob.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 4,
    borderRadius: 4,
    backgroundColor: ob.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ob.progressFill,
    borderRadius: 4,
  },
  card: {
    backgroundColor: ob.card,
    borderRadius: radii.card,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: ob.cardBorder,
    ...shadow.card,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: ob.text,
    marginBottom: spacing.sm,
  },
  cardHint: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: ob.muted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: ob.muted,
    marginBottom: spacing.sm,
  },
  textInput: {
    height: 52,
    borderRadius: radii.input,
    paddingHorizontal: spacing.base,
    backgroundColor: ob.accentSoft,
    borderWidth: 1,
    borderColor: ob.cardBorder,
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: ob.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: ob.cardBorder,
    backgroundColor: ob.accentSoft,
  },
  optionRowSelected: {
    borderColor: ob.progressFill,
    backgroundColor: '#1a3026',
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: ob.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: ob.muted,
    lineHeight: 18,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ob.progressFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  journeyWrap: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadow.card,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  journeyCardSelected: {
    borderColor: colors.primary,
  },
  journeyTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurface,
    marginBottom: 2,
  },
  journeyDesc: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  buttonWrap: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
