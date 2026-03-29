import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { colors, fonts, spacing, radii } from '../theme';
import {
  generateCounselorReply,
  getGeminiApiKey,
  type CounselorChatTurn,
} from '../lib/gemini-counselor';

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Reveals assistant text progressively; skips if already completed for this message id. */
function AssistantTypingText({
  messageId,
  fullText,
  skipAnimation,
  onTypingDone,
  style,
  cursorStyle,
}: {
  messageId: string;
  fullText: string;
  skipAnimation: boolean;
  onTypingDone: (id: string) => void;
  style: TextStyle | TextStyle[];
  cursorStyle: TextStyle;
}) {
  const [visible, setVisible] = useState(() => (skipAnimation ? fullText : ''));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(skipAnimation);

  useEffect(() => {
    doneRef.current = skipAnimation;
  }, [skipAnimation]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (skipAnimation) {
      setVisible(fullText);
      return;
    }

    setVisible('');
    let index = 0;

    const tick = () => {
      if (doneRef.current) return;

      const remaining = fullText.length - index;
      const step =
        remaining > 450 ? 6 : remaining > 200 ? 4 : remaining > 60 ? 2 : 1;
      index = Math.min(index + step, fullText.length);
      setVisible(fullText.slice(0, index));

      if (index >= fullText.length) {
        doneRef.current = true;
        onTypingDone(messageId);
        return;
      }

      const ms = remaining > 320 ? 8 : remaining > 80 ? 14 : 22;
      timerRef.current = setTimeout(tick, ms);
    };

    timerRef.current = setTimeout(tick, 48);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fullText, messageId, skipAnimation, onTypingDone]);

  const showCursor = !skipAnimation && visible.length < fullText.length;

  return (
    <Text style={style}>
      {visible}
      {showCursor ? <Text style={cursorStyle}>▍</Text> : null}
    </Text>
  );
}

export default function CounselorChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  /** Assistant message ids that finished the typewriter (so list updates don’t replay it). */
  const [typingDoneIds, setTypingDoneIds] = useState<Record<string, true>>({});
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<FlatList<Msg>>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const apiKey = getGeminiApiKey();

  const markTypingDone = useCallback((id: string) => {
    setTypingDoneIds((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!apiKey) {
      Alert.alert(
        'API key needed',
        'Add EXPO_PUBLIC_GEMINI_API_KEY to mobile/.env (Google AI Studio), save, then restart Expo with: npx expo start -c',
      );
      return;
    }

    setSendError(null);
    const userId = makeId();
    const userMsg: Msg = { id: userId, role: 'user', text };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const historyForApi: CounselorChatTurn[] = [
      ...messages.map((m) => ({ role: m.role, text: m.text })),
      { role: 'user', text },
    ];

    const result = await generateCounselorReply(apiKey, historyForApi, controller.signal);
    setLoading(false);

    if (controller.signal.aborted) return;

    if ('error' in result) {
      if (result.error === 'missing_key') {
        setSendError('Missing Gemini API key. Set EXPO_PUBLIC_GEMINI_API_KEY in mobile/.env.');
      } else {
        setSendError(result.error);
      }
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: 'assistant', text: result.text },
    ]);
  }, [apiKey, input, loading, messages]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Animated.View entering={FadeIn.duration(380)} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>AI Counselor</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(400).delay(50)} style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.disclaimerText}>
            This chat is not a substitute for emergency care, therapy, or medical advice. If you are in
            crisis, call or text 988 (US) or your local emergency number.
          </Text>
        </Animated.View>

        <FlatList
          ref={listRef}
          data={messages}
          extraData={typingDoneIds}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <Animated.View entering={FadeInUp.duration(480).delay(80)} style={styles.emptyWrap}>
              <Text style={styles.empty}>
                Share what is on your mind. The counselor responds using AI and is guided to support you
                thoughtfully.
              </Text>
            </Animated.View>
          }
          ListFooterComponent={
            loading ? (
              <Animated.View
                entering={FadeInUp.duration(280).springify().damping(18)}
                style={styles.typingRow}
              >
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </Animated.View>
            ) : null
          }
          renderItem={({ item }) => (
            <Animated.View
              entering={
                item.role === 'user'
                  ? FadeInRight.duration(300).springify().damping(18)
                  : FadeInLeft.duration(300).springify().damping(18)
              }
              style={[
                styles.bubbleWrap,
                item.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAssistant,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
              >
                {item.role === 'user' ? (
                  <Text
                    style={[styles.bubbleText, styles.bubbleTextUser]}
                  >
                    {item.text}
                  </Text>
                ) : (
                  <AssistantTypingText
                    messageId={item.id}
                    fullText={item.text}
                    skipAnimation={!!typingDoneIds[item.id]}
                    onTypingDone={markTypingDone}
                    style={[styles.bubbleText, styles.bubbleTextAssistant]}
                    cursorStyle={styles.typingCursor}
                  />
                )}
              </View>
            </Animated.View>
          )}
        />

        {sendError ? (
          <Animated.View entering={FadeIn.duration(240)} exiting={FadeOut.duration(160)}>
            <Text style={styles.errorBanner}>{sendError}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.duration(420).delay(70)} style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            maxLength={4000}
            editable={!loading}
            textAlignVertical="top"
          />
          <Pressable
            onPress={send}
            disabled={loading || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              (loading || !input.trim()) && styles.sendBtnDisabled,
              pressed && !loading && input.trim() && styles.sendBtnPressed,
            ]}
            hitSlop={8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
  },
  headerRight: {
    width: 40,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLighter,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  emptyWrap: {
    marginTop: spacing.xl,
  },
  empty: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  typingRow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  typingBubble: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.outlineVariant,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleWrap: {
    marginBottom: spacing.md,
    maxWidth: '92%',
  },
  bubbleWrapUser: {
    alignSelf: 'flex-end',
  },
  bubbleWrapAssistant: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
  },
  bubbleAssistant: {
    backgroundColor: colors.outlineVariant,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextAssistant: {
    color: colors.onSurface,
  },
  typingCursor: {
    fontSize: 14,
    color: colors.primary,
    opacity: 0.75,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.error,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.onSurface,
    backgroundColor: colors.surface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnPressed: {
    opacity: 0.88,
  },
});
