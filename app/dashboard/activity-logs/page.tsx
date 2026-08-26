'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Calendar,
  Filter,
  Layers,
  RefreshCw,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { PageContainer, PageHeader, StatCard, StatCardGrid, DataTablePagination } from '../../../components/ui';
import { ExportMenu } from '../../../components/export-menu';
import { api, formatDateTime } from '../../../lib/api';
import { useTranslation } from '../../../provider';

export default function ActivityLogsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['activity-logs', page, limit, moduleFilter, actionFilter, search],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set('page', String(page));
      sp.set('limit', String(limit));
      if (moduleFilter) sp.set('module', moduleFilter);
      if (actionFilter) sp.set('action', actionFilter);
      if (search) sp.set('search', search);
      return api<any>(`/activity-logs?${sp.toString()}`);
    },
  });

  const logs = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const exportColumns = [
    { header: t('activity_logs.timestamp'), key: 'createdAt', formatter: (r: any) => formatDateTime(r.createdAt) },
    { header: t('users.user_name'), key: 'user.name', formatter: (r: any) => r.user?.name || 'System' },
    { header: t('common.email'), key: 'user.email', formatter: (r: any) => r.user?.email || 'system@stockpilot.io' },
    { header: t('activity_logs.action'), key: 'action' },
    { header: t('activity_logs.module'), key: 'module' },
    { header: t('activity_logs.reference'), key: 'reference' },
    { header: t('activity_logs.ip_address'), key: 'ip' },
  ];

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('activity_logs.title')}
            description={t('activity_logs.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('activity_logs.title') }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu filename="StockPilot_Audit_Logs" columns={exportColumns} data={logs} />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
                  <span>{t('common.refresh')}</span>
                </button>
              </div>
            }
          />

          <StatCardGrid columns={4}>
            <StatCard
              label={t('activity_logs.total_logged_events')}
              value={meta.total}
              detail={t('activity_logs.recorded_operations')}
              icon={<Activity size={20} color="#5068e6" />}
              kind="blue"
            />
            <StatCard
              label={t('activity_logs.module_filter')}
              value={moduleFilter || t('activity_logs.all_modules')}
              detail={t('activity_logs.category_scope')}
              icon={<Layers size={20} color="#28a476" />}
              kind="green"
            />
            <StatCard
              label={t('activity_logs.security_tracking')}
              value={t('activity_logs.security_active')}
              detail={t('activity_logs.security_detail')}
              icon={<Shield size={20} color="#8e71eb" />}
              kind="blue"
            />
            <StatCard
              label={t('common.page')}
              value={`${meta.page} / ${meta.totalPages || 1}`}
              detail={`${meta.total} ${t('common.total')}`}
              icon={<Calendar size={20} color="#d28d2b" />}
              kind="amber"
            />
          </StatCardGrid>

          {/* Filter Bar */}
          <div
            className="card"
            style={{
              marginTop: 16,
              marginBottom: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'center',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200, background: '#f5f7fc', padding: '6px 12px', borderRadius: 6 }}>
              <Search size={14} color="#8b94b0" />
              <input
                type="text"
                placeholder={t('activity_logs.search_placeholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  border: 0,
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.83rem',
                  color: '#1a2238',
                  width: '100%',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #dcdfe8',
                  fontSize: '0.82rem',
                  background: '#fff',
                }}
              >
                <option value="">{t('activity_logs.all_modules')}</option>
                <option value="PRODUCTS">{t('products.title')}</option>
                <option value="CATEGORIES">{t('categories.title')}</option>
                <option value="SALES">{t('sales.title')}</option>
                <option value="PURCHASES">{t('purchases.title')}</option>
                <option value="INVENTORY">{t('inventory.stock_position')}</option>
                <option value="CUSTOMERS">{t('customers.title')}</option>
                <option value="SUPPLIERS">{t('suppliers.title')}</option>
                <option value="PAYMENTS">{t('payments.title')}</option>
                <option value="EXPENSES">{t('expenses.title')}</option>
                <option value="SETTINGS">{t('settings.title')}</option>
              </select>

              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #dcdfe8',
                  fontSize: '0.82rem',
                  background: '#fff',
                }}
              >
                <option value="">{t('activity_logs.all_actions')}</option>
                <option value="CREATE">{t('common.create')}</option>
                <option value="UPDATE">{t('common.edit')}</option>
                <option value="DELETE">{t('common.delete')}</option>
                <option value="CANCEL">{t('status.cancelled')}</option>
                <option value="RETURN">{t('sales.returns_title')}</option>
                <option value="PAYMENT">{t('payments.title')}</option>
                <option value="SETTINGS_CHANGE">{t('settings.title')}</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="card table-container">
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#8b94b0' }}>{t('common.loading')}</div>
            ) : logs.length === 0 ? (
              <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
                <Activity size={36} color="#8b94b0" style={{ margin: '0 auto 10px' }} />
                <h3>{t('activity_logs.no_logs')}</h3>
                <p style={{ color: '#8b94b0', fontSize: '0.88rem' }}>{t('activity_logs.no_logs_desc')}</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{t('activity_logs.timestamp')}</th>
                    <th>{t('users.user_name')}</th>
                    <th>{t('activity_logs.module')}</th>
                    <th>{t('activity_logs.action')}</th>
                    <th>{t('activity_logs.reference')}</th>
                    <th>{t('activity_logs.ip_address')}</th>
                    <th style={{ textAlign: 'right' }}>{t('activity_logs.payload')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => {
                    let actionBadgeColor = '#2563eb';
                    let actionBadgeBg = '#eff6ff';
                    if (log.action === 'CREATE') {
                      actionBadgeColor = '#16a34a';
                      actionBadgeBg = '#f0fdf4';
                    } else if (log.action === 'CANCEL' || log.action === 'DELETE') {
                      actionBadgeColor = '#dc2626';
                      actionBadgeBg = '#fef2f2';
                    } else if (log.action === 'RETURN') {
                      actionBadgeColor = '#d97706';
                      actionBadgeBg = '#fffbeb';
                    }

                    return (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: '#5a647e', whiteSpace: 'nowrap' }}>
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#e0e7ff',
                                color: '#4338ca',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                              }}
                            >
                              {log.user?.name ? log.user.name.slice(0, 1).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.84rem', color: '#1a2238' }}>{log.user?.name || 'System Auto'}</strong>
                              <small style={{ display: 'block', color: '#8b94b0', fontSize: '0.72rem' }}>
                                {log.user?.role || 'SYSTEM'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {log.module}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: actionBadgeBg,
                              color: actionBadgeColor,
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{log.reference || '—'}</td>
                        <td style={{ fontSize: '0.78rem', color: '#8b94b0', fontFamily: 'monospace' }}>
                          {log.ip || '127.0.0.1'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {log.details ? (
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => setSelectedLog(log)}
                              style={{ fontSize: '0.76rem', padding: '3px 8px', height: 'auto' }}
                            >
                              {t('common.view')}
                            </button>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {meta.total > 0 && (
              <div style={{ padding: '0 12px 12px' }}>
                <DataTablePagination
                  page={page}
                  total={meta.total}
                  limit={limit}
                  onPage={setPage}
                  onLimitChange={setLimit}
                />
              </div>
            )}
          </div>

          {/* Details Modal */}
          {selectedLog && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: 16,
              }}
              onClick={() => setSelectedLog(null)}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: 580,
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  padding: 24,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t('activity_logs.payload')}</h3>
                  <button type="button" className="ghost" onClick={() => setSelectedLog(null)}>
                    ✕
                  </button>
                </div>
                <div style={{ fontSize: '0.82rem', marginBottom: 12, color: '#5a647e' }}>
                  <strong>{selectedLog.action}</strong> on <strong>{selectedLog.module}</strong> ({selectedLog.reference}) by {selectedLog.user?.name || 'System'}
                </div>
                <pre
                  style={{
                    background: '#0f172a',
                    color: '#38bdf8',
                    padding: 14,
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    overflowX: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
                <div style={{ textAlign: 'right', marginTop: 16 }}>
                  <button type="button" className="primary" onClick={() => setSelectedLog(null)}>
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
