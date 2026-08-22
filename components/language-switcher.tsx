'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useAppLanguage, LanguageCode } from '../provider';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark' | 'minimal';
  showLabel?: boolean;
}

export function LanguageSwitcher({ variant = 'dark', showLabel = true }: LanguageSwitcherProps) {
  const { language, setLanguage } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: LanguageCode; label: string; short: string; flag: string }[] = [
    { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
    { code: 'bn', label: 'বাংলা (Bengali)', short: 'বাংলা', flag: '🇧🇩' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const isDark = variant === 'dark';
  const isMinimal = variant === 'minimal';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: isDark
            ? 'rgba(255,255,255,0.06)'
            : isMinimal
            ? 'transparent'
            : '#ffffff',
          color: isDark ? '#e2e8f0' : '#334155',
          border: isDark
            ? '1px solid rgba(255,255,255,0.12)'
            : isMinimal
            ? 'none'
            : '1px solid #cbd5e1',
          borderRadius: 8,
          padding: isMinimal ? '4px 8px' : '6px 12px',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: !isDark && !isMinimal ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
        }}
        title="Change Language / ভাষা পরিবর্তন"
      >
        <Globe size={14} color={isDark ? '#818cf8' : '#4f46e5'} />
        <span style={{ fontSize: '0.9rem' }}>{currentLang.flag}</span>
        {showLabel && <span>{currentLang.short}</span>}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: isDark ? '110%' : undefined,
            top: !isDark ? '110%' : undefined,
            right: 0,
            zIndex: 9999,
            minWidth: 150,
            background: isDark ? '#1e2538' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '6px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {languages.map((l) => {
            const active = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: active
                    ? isDark
                      ? 'rgba(99,102,241,0.2)'
                      : '#eef2ff'
                    : 'transparent',
                  color: active
                    ? isDark
                      ? '#a5b4fc'
                      : '#4338ca'
                    : isDark
                    ? '#cbd5e1'
                    : '#475569',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </div>
                {active && <Check size={14} color={isDark ? '#818cf8' : '#4f46e5'} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
