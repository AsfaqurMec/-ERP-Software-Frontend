'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    let isMounted = true;

    function verifyAuth() {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      if (!token) {
        const nextParam = path && path !== '/dashboard' ? `?next=${encodeURIComponent(path)}` : '';
        router.replace(`/login${nextParam}`);
        return;
      }

      // Check if user object is cached in localStorage for instant optimistic rendering
      try {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setReady(true);
        }
      } catch {
        // ignore JSON parse error
      }

      // Background session verification (runs once on mount)
      api<Session>('/auth/me')
        .then((sessionUser) => {
          if (!isMounted) return;
          localStorage.setItem('user', JSON.stringify(sessionUser));
          setUser(sessionUser);
          setReady(true);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('Session validation failed:', err?.message || err);
          // If token is invalid or expired, clear and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login');
        });
    }

    verifyAuth();

    // Safety timeout: Never leave the user stuck on the loading screen
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        const token = localStorage.getItem('token');
        if (token) {
          setReady(true);
        } else {
          router.replace('/login');
        }
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
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
