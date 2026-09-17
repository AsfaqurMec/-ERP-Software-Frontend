'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../lib/api';

export type Session = {
  id: string;
  name: string;
  email: string;
  role: string;
};

interface AuthContextValue {
  user: Session | null;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const parentAuth = useContext(AuthContext);

  // If already wrapped in a parent AuthGuard (e.g. dashboard layout), pass through immediately!
  if (parentAuth) {
    return <>{children}</>;
  }

  return <AuthGuardRoot router={router} path={path}>{children}</AuthGuardRoot>;
}

function AuthGuardRoot({
  children,
  router,
  path,
}: {
  children: React.ReactNode;
  router: ReturnType<typeof useRouter>;
  path: string;
}) {
  const [user, setUser] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      const nextParam = path && path !== '/dashboard' ? `?next=${encodeURIComponent(path)}` : '';
      router.replace(`/login${nextParam}`);
      return;
    }

    // 1. Optimistic rendering: If cached user is available in localStorage, render instantly
    let hasCachedUser = false;
    try {
      const cached = localStorage.getItem('user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
          setReady(true);
          isReadyRef.current = true;
          hasCachedUser = true;
        }
      }
    } catch {
      // ignore JSON parse error
    }

    // 2. Validate & refresh session with backend
    api<Session>('/auth/me')
      .then((sessionUser) => {
        if (!isMounted) return;
        localStorage.setItem('user', JSON.stringify(sessionUser));
        setUser(sessionUser);
        setReady(true);
        isReadyRef.current = true;
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Session verification notice:', err?.message || err);

        // Check if token was invalidated/removed (e.g. 401 response in api.ts)
        const currentToken = localStorage.getItem('token');
        const isUnauthorized = !currentToken || /unauthorized|expired|invalid/i.test(err?.message || '');

        if (isUnauthorized) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          const nextParam = path && path !== '/dashboard' ? `?next=${encodeURIComponent(path)}` : '';
          router.replace(`/login${nextParam}`);
        } else if (!hasCachedUser) {
          // If network or server error but not 401, unblock spinner so user is not permanently stuck
          setReady(true);
          isReadyRef.current = true;
        }
      });

    // 3. Fallback spinner timeout: If backend is slow, ensure loading spinner clears without evicting the token
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !isReadyRef.current) {
        if (localStorage.getItem('token')) {
          setReady(true);
          isReadyRef.current = true;
        } else {
          router.replace('/login');
        }
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []); // Run once on initial layout mount, NOT on every route change!

  if (!ready) {
    return (
      <div
        className="auth-loading"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          background: '#f8fafc',
          color: '#475569',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
          Validating your secure session…
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
