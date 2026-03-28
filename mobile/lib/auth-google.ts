import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth via Supabase (PKCE). Enable Google in Supabase → Authentication → Providers,
 * and add this app’s redirect URL under Authentication → URL Configuration → Redirect URLs.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    const redirectTo = Linking.createURL('auth/callback');

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) return { error: oauthError };
    if (!data?.url) return { error: new Error('Could not start Google sign-in') };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      preferEphemeralSession: true,
    });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { error: null };
    }

    if (result.type !== 'success' || !('url' in result) || !result.url) {
      return { error: new Error('Google sign-in did not complete') };
    }

    const parsed = new URL(result.url);
    const errParam = parsed.searchParams.get('error_description') ?? parsed.searchParams.get('error');
    if (errParam) {
      return { error: new Error(decodeURIComponent(errParam.replace(/\+/g, ' '))) };
    }

    const code = parsed.searchParams.get('code');
    if (!code) {
      return { error: new Error('No authorization code returned. Add your redirect URL in Supabase Dashboard → Authentication → URL Configuration.') };
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return { error: exchangeError };

    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}
