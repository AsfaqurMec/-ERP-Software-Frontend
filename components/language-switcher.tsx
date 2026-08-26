'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check } from 'lucide-react';
import { useAppLanguage, LanguageCode } from '../provider';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark' | 'minimal';
  showLabel?: boolean;
}

export function LanguageSwitcher({ variant = 'dark', showLabel = true }: LanguageSwitcherProps) {
  const { language, setLanguage } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const isAbove = spaceBelow < 130 && rect.top > 130;

    const newCoords: { top?: number; bottom?: number; left?: number; right?: number } = {};

    if (isAbove) {
      newCoords.bottom = window.innerHeight - rect.top + 6;
    } else {
      newCoords.top = rect.bottom + 6;
    }

    if (rect.left + 170 > window.innerWidth) {
      newCoords.right = Math.max(8, window.innerWidth - rect.right);
    } else {
      newCoords.left = Math.max(8, rect.left);
    }

    setCoords(newCoords);
  };

  const handleToggle = () => {
    if (!open) {
      updatePosition();
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    function handleScrollOrResize() {
      updatePosition();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [open]);

  const languages: { code: LanguageCode; label: string; short: string; flag: string }[] = [
    { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' },
    { code: 'bn', label: 'বাংলা (Bengali)', short: 'বাংলা', flag: '🇧🇩' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const isDark = variant === 'dark';
  const isMinimal = variant === 'minimal';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
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

      {open && mounted && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: coords.top,
            bottom: coords.bottom,
            left: coords.left,
            right: coords.right,
            zIndex: 99999,
            minWidth: 160,
            background: isDark ? '#1a2035' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '6px',
            boxShadow: '0 16px 36px -4px rgba(0,0,0,0.35), 0 0 1px 1px rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            animation: 'flyoutFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
                      ? 'rgba(99,102,241,0.25)'
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
                  transition: 'background 0.12s ease',
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
        </div>,
        document.body
      )}
    </div>
  );
}
