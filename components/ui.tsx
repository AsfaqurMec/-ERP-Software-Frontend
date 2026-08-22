'use client';

import React, { ReactNode } from 'react';
import { LoaderCircle, Search, TriangleAlert, Calendar, Filter, X, Check, ArrowUpDown } from 'lucide-react';
import { money } from '../lib/api';
import { useTranslation } from '../provider';

// ==========================================
// 1. Layout & Page Containers
// ==========================================

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
}
export const PageContainer = ({ children, className = '' }: PageContainerProps) => (
  <section className={`page-container ${className}`}>{children}</section>
);

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: ReactNode;
}
export const PageHeader = ({ title, description, breadcrumbs, action }: PageHeaderProps) => (
  <div className="page-header">
    <div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="breadcrumb-trail" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'nowrap', gap: 6, marginBottom: 6, fontSize: 12, color: '#8c93a8' }}>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {b.href ? (
                <a href={b.href} style={{ color: '#526ae8', textDecoration: 'none', fontWeight: 500 }}>
                  {b.label}
                </a>
              ) : (
                <span style={{ color: '#64748b', fontWeight: 600 }}>{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span style={{ color: '#cbd5e1', userSelect: 'none' }}>/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="header-action-wrap">{action}</div>}
  </div>
);

// ==========================================
// 2. Data Displays & Badges
// ==========================================

export const CurrencyDisplay = ({ value }: { value: number | string | null | undefined }) => (
  <>{money(value ?? 0)}</>
);

export const NumberDisplay = ({ value }: { value: number | string | null | undefined }) => (
  <>{new Intl.NumberFormat('en-BD').format(Number(value ?? 0))}</>
);

export const DateDisplay = ({ value }: { value: string | Date | null | undefined }) => {
  if (!value) return <>—</>;
  return <>{new Date(value).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</>;
};

export const PriceDisplay = CurrencyDisplay;

export function StatusBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span>—</span>;
  const normalized = value.toLowerCase();
  return <span className={`status ${normalized}`}>{value.replace(/_/g, ' ')}</span>;
}

export function PaymentStatusBadge({ value }: { value: string | null | undefined }) {
  return <StatusBadge value={value} />;
}

// ==========================================
// 3. Stats & Cards
// ==========================================

export interface StatCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
  kind?: 'blue' | 'green' | 'amber' | 'rose' | 'neutral';
  trend?: string;
}

export function StatCard({ label, value, detail, icon, kind = 'blue', trend }: StatCardProps) {
  return (
    <div className={`simple-stat ${kind}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
          {detail && <small>{detail}</small>}
          {trend && <small style={{ color: '#26a473', marginTop: 4 }}>{trend}</small>}
        </div>
        {icon && <div className="stat-icon">{icon}</div>}
      </div>
    </div>
  );
}

export const StatCardGrid = ({ children, columns = 4 }: { children: ReactNode; columns?: number }) => (
  <div className="simple-stat-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {children}
  </div>
);

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}
export function ChartCard({ title, subtitle, action, children, className = '' }: ChartCardProps) {
  return (
    <section className={`card ${className}`}>
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// ==========================================
// 4. Data Tables & Pagination
// ==========================================

export interface DataTableProps {
  columns: string[];
  children: ReactNode;
  className?: string;
}
export function DataTable({ columns, children, className = '' }: DataTableProps) {
  return (
    <div className={`table-wrap ${className}`}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const DataTableToolbar = ({ children }: { children: ReactNode }) => (
  <div className="table-toolbar">{children}</div>
);

export interface DataTablePaginationProps {
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  page,
  total,
  limit,
  onPage,
  onLimitChange,
  pageSizeOptions = [20, 50, 100, 150, 200, 500],
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers: show current page, next 2 pages, first/last pages & ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    const windowStart = Math.max(1, page - 1);
    const windowEnd = Math.min(totalPages, page + 2);

    if (windowStart > 1) {
      pages.push(1);
      if (windowStart > 2) {
        pages.push('ellipsis-start');
      }
    }

    for (let i = windowStart; i <= windowEnd; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (windowEnd < totalPages) {
      if (windowEnd < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const { t } = useTranslation();
  const pageNumbers = getPageNumbers();

  return (
    <div
      className="pagination-wrapper"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        marginTop: 16,
        padding: '12px 16px',
        background: '#ffffff',
        border: '1px solid #edf0f7',
        borderRadius: 10,
        fontSize: 13,
        color: '#64748b',
      }}
    >
      {/* Left side: Results Count info & Rows per page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          {t('common.showing')} <strong style={{ color: '#1e293b' }}>{startItem}</strong> {t('common.to')}{' '}
          <strong style={{ color: '#1e293b' }}>{endItem}</strong> {t('common.of')}{' '}
          <strong style={{ color: '#1e293b' }}>{total}</strong> {t('common.entries')}
        </div>

        {onLimitChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>{t('common.rows_per_page')}</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                onLimitChange(newLimit);
                onPage(1);
              }}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page navigation buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          style={{
            border: '1px solid #cbd5e1',
            background: page <= 1 ? '#f8fafc' : '#ffffff',
            color: page <= 1 ? '#94a3b8' : '#334155',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          ‹ {t('common.previous')}
        </button>

        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis-start' || p === 'ellipsis-end') {
            return (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94a3b8' }}>
                …
              </span>
            );
          }

          const isCurrent = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              style={{
                minWidth: 32,
                height: 32,
                padding: '0 8px',
                borderRadius: 6,
                border: isCurrent ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                background: isCurrent ? '#4f46e5' : '#ffffff',
                color: isCurrent ? '#ffffff' : '#334155',
                fontWeight: isCurrent ? 700 : 500,
                fontSize: 12,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? '0 2px 6px rgba(79,70,229,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          style={{
            border: '1px solid #cbd5e1',
            background: page >= totalPages ? '#f8fafc' : '#ffffff',
            color: page >= totalPages ? '#94a3b8' : '#334155',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          {t('common.next')} ›
        </button>
      </div>
    </div>
  );
}

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="skeleton">
    <LoaderCircle className="spin" size={18} style={{ display: 'inline', marginRight: 8 }} />
    Loading {rows} records…
  </div>
);

export const EmptyTableState = ({ message }: { message?: string }) => {
  const { t } = useTranslation();
  return <div className="empty">{message || t('common.no_records_found')}</div>;
};

// ==========================================
// 5. Form Components & Inputs
// ==========================================

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <Search size={16} color="#8c93a8" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 2 }}
        >
          <X size={14} color="#8c93a8" />
        </button>
      )}
    </label>
  );
}

export function FilterDropdown({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  label?: string;
}) {
  return (
    <select aria-label={label || 'Filter'} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label || 'All'}</option>
      {options.map((x) => (
        <option key={x.value} value={x.value}>
          {x.label}
        </option>
      ))}
    </select>
  );
}

export function StatusFilter({
  value,
  onChange,
  options = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ],
}: {
  value: string;
  onChange: (v: string) => void;
  options?: { label: string; value: string }[];
}) {
  return (
    <select aria-label="Status filter" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((x) => (
        <option key={x.value} value={x.value}>
          {x.label}
        </option>
      ))}
    </select>
  );
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from?: string;
  to?: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #dfe4ef', borderRadius: 8, padding: '0 8px' }}>
      <Calendar size={15} color="#8c93a8" />
      <input
        type="date"
        value={from || ''}
        onChange={(e) => onFromChange(e.target.value)}
        style={{ border: 0, padding: '8px 4px', fontSize: 12, outline: 'none' }}
      />
      <span style={{ fontSize: 12, color: '#8c93a8' }}>to</span>
      <input
        type="date"
        value={to || ''}
        onChange={(e) => onToChange(e.target.value)}
        style={{ border: 0, padding: '8px 4px', fontSize: 12, outline: 'none' }}
      />
    </div>
  );
}

export const FormSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="form-section">
    <legend>{title}</legend>
    {children}
  </fieldset>
);

export function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="form-field">
      <span>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </span>
      {children}
      {error && <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 'normal' }}>{error}</span>}
    </label>
  );
}

export const FormActions = ({ children }: { children: ReactNode }) => <div className="form-actions">{children}</div>;

// ==========================================
// 6. Dialogs & Overlays
// ==========================================

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h3>{title}</h3>
        <p>{children}</p>
        <div>
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={danger ? 'danger' : 'primary-button'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export const DeleteDialog = (props: Omit<Parameters<typeof ConfirmDialog>[0], 'danger'>) => (
  <ConfirmDialog {...props} danger={true} confirmLabel="Delete" />
);

export const DetailsDialog = ({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog" style={{ width: 'min(100%, 650px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>{title}</h3>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 7. Feedback & State Display
// ==========================================

export const LoadingSpinner = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="loading">
    <LoaderCircle className="spin" size={22} style={{ display: 'inline', marginRight: 8 }} /> {label}
  </div>
);

export const Skeleton = ({ height = 100 }: { height?: number }) => (
  <div className="skeleton" style={{ height }} />
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="error">
    <TriangleAlert size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
    {message}
    {onRetry && (
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);

export const EmptyState = EmptyTableState;
