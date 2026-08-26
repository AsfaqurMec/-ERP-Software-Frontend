'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, ChevronDown } from 'lucide-react';
import { exportToCsv, exportToExcel, exportToPrintOrPdf, type ExportColumn } from '../lib/export';
import { useTranslation } from '../provider';

export interface ExportMenuProps<T = any> {
  filename: string;
  columns: ExportColumn<T>[];
  data: T[];
  label?: string;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function ExportMenu<T = any>({
  filename,
  columns,
  data,
  label,
  title,
  subtitle,
  disabled = false,
}: ExportMenuProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayLabel = label || t('common.export');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const reportTitle =
    title ||
    filename
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Report';

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="ghost"
        disabled={disabled || !data || data.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.85rem',
          padding: '6px 12px',
          borderRadius: 6,
          cursor: disabled || !data?.length ? 'not-allowed' : 'pointer',
          opacity: disabled || !data?.length ? 0.6 : 1,
        }}
      >
        <Download size={15} />
        <span>{displayLabel}</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            zIndex: 50,
            minWidth: 175,
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e2e6f0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <button
            type="button"
            onClick={() => {
              exportToCsv(filename, columns, data);
              setOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              fontSize: '0.83rem',
              color: '#1a2238',
              border: 0,
              background: 'transparent',
              textAlign: 'left',
              width: '100%',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f5fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FileText size={15} color="#2563eb" />
            <span>{t('common.export_csv')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              exportToExcel(filename, columns, data);
              setOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              fontSize: '0.83rem',
              color: '#1a2238',
              border: 0,
              background: 'transparent',
              textAlign: 'left',
              width: '100%',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f5fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FileSpreadsheet size={15} color="#16a34a" />
            <span>{t('common.export_excel')}</span>
          </button>

          <div style={{ height: 1, background: '#edf0f7', margin: '2px 0' }} />

          <button
            type="button"
            onClick={() => {
              exportToPrintOrPdf(reportTitle, columns, data, subtitle);
              setOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              fontSize: '0.83rem',
              color: '#1a2238',
              border: 0,
              background: 'transparent',
              textAlign: 'left',
              width: '100%',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f5fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Printer size={15} color="#475569" />
            <span>{t('common.export_pdf')} / {t('common.print')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
