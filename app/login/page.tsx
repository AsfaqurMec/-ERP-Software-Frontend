'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteSettings } from '../../hooks/use-site-settings';
import { useTranslation } from '../../provider';
import { LanguageSwitcher } from '../../components/language-switcher';

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const siteName = settings?.business_name || 'ব্যবসারথি';
  const siteLogo = settings?.business_logo;

  async function handleGuestLogin() {
    setError('');
    setGuestLoading(true);
    try {
      const result = await api<{ token: string; user: { name: string; role: string; isGuest?: boolean } }>('/auth/guest', {
        method: 'POST',
      });
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in as guest.');
    } finally {
      setGuestLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      setError(t('auth.validation_error'));
      return;
    }

    setLoading(true);
    try {
      const result = await api<{ token: string; user: { name: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page" style={{ position: 'relative' }}>
      {/* Floating Language Switcher on Top Right */}
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}>
        <LanguageSwitcher variant="light" showLabel={true} />
      </div>

      <div className="login-card">
        {/* Dynamic Brand Logo & Site Name: Centered with Logo on Top, Title on Next Line */}
        <div
          className="login-brand"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          {siteLogo && (
            <img
              src={siteLogo}
              alt={siteName}
              style={{
                width: 72,
                height: 72,
                borderRadius: 0,
                objectFit: 'cover',
                padding: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            />
          )}
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {siteName}
          </h1>
        </div>

        <h2 style={{ textAlign: 'center' }}>{t('auth.welcome_back')}</h2>
        <p style={{ textAlign: 'center' }}>{t('auth.sign_in_desc')}</p>

        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
              <span>{t('auth.email_address')}</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }}
                />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
              <span>{t('auth.password')}</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  minLength={8}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    background: 'none',
                    border: 'none',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          </div>

          {error && (
            <div
              className="form-error"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 14,
                background: '#fef2f2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #fecaca',
                fontSize: '0.85rem',
              }}
            >
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || guestLoading}
            style={{
              marginTop: 22,
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: (loading || guestLoading) ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
          >
            {loading ? t('auth.authenticating') : t('auth.sign_in_securely')}
          </button>

          {/* Visual Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
              {t('auth.or_continue_with')}
            </span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Guest Mode Instant 1-Click Access */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading || loading}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 8,
              border: '1.5px solid #6366f1',
              background: '#ffffff',
              color: '#4338ca',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: (guestLoading || loading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (!guestLoading && !loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!guestLoading && !loading) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#4338ca';
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1)';
              }
            }}
          >
            <Eye size={17} />
            <span>{guestLoading ? t('auth.logging_in_guest') : t('auth.explore_as_guest')}</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748b', marginTop: 10, marginBottom: 0, lineHeight: 1.4 }}>
            {t('auth.guest_mode_note')}
          </p>
        </form>
      </div>
    </div>
  );
}
