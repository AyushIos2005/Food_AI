import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { configureApiClient } from '@/src/api/client';
import { authApi, notificationApi } from '@/src/api/services';
import { ApiError } from '@/src/api/errors';
import type { AuthUser } from '@/src/types/api';

// Only the session token and the user summary are persisted, and only in SecureStore (Keystore-backed).
// Passwords and OTPs are never stored.
const TOKEN_KEY = 'foodai.session.token';
const USER_KEY = 'foodai.session.user';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface SessionValue {
  status: Status;
  user: AuthUser | null;
  signIn: (user: AuthUser, token: string | null) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const tokenRef = useRef<string | null>(null);

  const clearLocal = useCallback(async () => {
    tokenRef.current = null;
    setUser(null);
    setStatus('signedOut');
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(USER_KEY).catch(() => {}),
    ]);
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (tokenRef.current) await authApi.logout();
    } catch {
      // Logout is best-effort; the local session is always cleared.
    }
    await clearLocal();
  }, [clearLocal]);

  const signIn = useCallback(async (nextUser: AuthUser, token: string | null) => {
    tokenRef.current = token;
    setUser(nextUser);
    setStatus('signedIn');
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser)).catch(() => {});
  }, []);

  // Wire the API client: any 401 on an authenticated call logs the user out (no redirect loops — the guard
  // in app/index.tsx only reads state).
  useEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onUnauthorized: () => {
        if (tokenRef.current !== null || status === 'signedIn') void clearLocal();
      },
    });
  }, [clearLocal, status]);

  // Restore session on launch. A network failure keeps the cached user (offline-tolerant); a 401 clears it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await safeGet(TOKEN_KEY);
      const cached = await safeGet(USER_KEY);
      if (!token || !cached) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      tokenRef.current = token;
      try {
        const parsed = JSON.parse(cached) as AuthUser;
        if (!cancelled) {
          setUser(parsed);
          setStatus('signedIn');
        }
        await notificationApi.list(1);
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'unauthorized') {
          if (!cancelled) await clearLocal();
        }
        // Other errors: stay signed in with the cached user.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
