import Constants from 'expo-constants';

/** Shown to Gemini on every request so replies stay in character before any user text is sent. */
export const COUNSELOR_SYSTEM_INSTRUCTION =
  'You act as an experienced counselor. Listen with empathy, reflect feelings clearly, and offer supportive, practical guidance. You are not a licensed therapist or clinician. If someone may be in immediate danger or crisis, encourage them to contact local emergency services or a crisis line (for example 988 in the US). Keep responses warm and concise unless the user asks for more depth.';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest'] as const;

export type CounselorChatTurn = { role: 'user' | 'assistant'; text: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getGeminiApiKey(): string {
  const extra = Constants.expoConfig?.extra as { geminiApiKey?: string } | undefined;
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_GEMINI_API_KEY === 'string'
      ? process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim()
      : '';
  const fromExtra =
    typeof extra?.geminiApiKey === 'string' ? extra.geminiApiKey.trim() : '';
  const raw = fromEnv || fromExtra;
  if (!raw.length) return '';
  return raw.replace(/^["']|["']$/g, '');
}

function extractAssistantText(data: {
  candidates?: Array<{ content?: { parts?: { text?: string }[] } }>;
  error?: { message?: string };
  promptFeedback?: { blockReason?: string };
}): { ok: true; text: string } | { ok: false; reason: string } {
  if (data.error?.message) {
    return { ok: false, reason: data.error.message };
  }
  if (data.promptFeedback?.blockReason) {
    return { ok: false, reason: `Content could not be processed (${data.promptFeedback.blockReason}).` };
  }
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) {
    return { ok: false, reason: 'No response from the model.' };
  }
  const text = parts.map((p) => (typeof p.text === 'string' ? p.text : '')).join('');
  if (!text.trim()) {
    return { ok: false, reason: 'Empty response.' };
  }
  return { ok: true, text: text.trim() };
}

/**
 * Sends the full conversation (must start with a user message). System instruction is applied server-side.
 */
export async function generateCounselorReply(
  apiKey: string,
  messages: CounselorChatTurn[],
  signal?: AbortSignal,
): Promise<{ text: string } | { error: string }> {
  if (!apiKey) {
    return { error: 'missing_key' };
  }
  if (!messages.length || messages[0].role !== 'user') {
    return { error: 'Conversation must begin with a user message.' };
  }

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.text }],
  }));

  const body = JSON.stringify({
    systemInstruction: {
      parts: [{ text: COUNSELOR_SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const runFetch = () =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal,
      });

    let res = await runFetch();
    if (res.status === 429) {
      await sleep(2500);
      if (!signal?.aborted) res = await runFetch();
    }
    if (res.status === 429) {
      await sleep(5000);
      if (!signal?.aborted) res = await runFetch();
    }

    if (res.status === 404 || res.status === 400) {
      if (__DEV__) {
        const t = await res.text().catch(() => '');
        console.warn(`[Gemini counselor] ${model} HTTP ${res.status}`, t.slice(0, 300));
      }
      continue;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      if (__DEV__) console.warn(`[Gemini counselor] ${model} HTTP ${res.status}`, errText.slice(0, 400));
      return {
        error:
          res.status === 403
            ? 'API key was rejected. Check EXPO_PUBLIC_GEMINI_API_KEY in mobile/.env.'
            : `Could not reach the counselor service (${res.status}). Try again later.`,
      };
    }

    const data = (await res.json()) as Parameters<typeof extractAssistantText>[0];
    const parsed = extractAssistantText(data);
    if (parsed.ok) {
      return { text: parsed.text };
    }
    if (parsed.reason.includes('No response') || parsed.reason.includes('Empty')) {
      continue;
    }
    return { error: parsed.reason };
  }

  return { error: 'The counselor is temporarily unavailable. Try again in a moment.' };
}
