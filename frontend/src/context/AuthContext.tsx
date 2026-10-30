import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import authService from '../services/authService';
import type { CurrentUser } from '../types/auth';

/** `error` = the API couldn't be reached; treated as signed out for gating. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Redirects to Google; the session is picked up when the browser returns to /login. */
  signInWithGoogle: (returnTo: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Who is signed in, as the Merch API sees them (GET /api/auth/me). That covers
 * a session started here (Supabase, sent as a Bearer token) and one started on
 * any other Sondarr site (the shared .sondarr.com cookie).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      setUser(await authService.me());
      setStatus('authenticated');
    } catch (err) {
      setUser(null);
      setStatus(httpStatus(err) === 401 ? 'unauthenticated' : 'error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Deferred: calling Supabase (which the API client does) inside this
      // callback can deadlock supabase-js.
      setTimeout(() => {
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
          // Keep the shared cookie in step with the token so other Sondarr sites stay signed in.
          void authService.createSession(session.access_token).catch(() => undefined);
        }
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          void refresh();
        }
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const signInWithGoogle = useCallback(async (returnTo: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login?returnTo=${encodeURIComponent(returnTo)}` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    // Clear the shared cookie first — it signs the user out of every Sondarr site.
    await authService.logout().catch(() => undefined);
    await supabase.auth.signOut();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signInWithGoogle, signOut }),
    [status, user, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

function httpStatus(err: unknown): number | undefined {
  return typeof err === 'object' && err !== null && 'response' in err
    ? (err as { response?: { status?: number } }).response?.status
    : undefined;
}
