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

export default function ActivityLogsPage() {
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
    { header: 'Timestamp', key: 'createdAt', formatter: (r: any) => formatDateTime(r.createdAt) },
    { header: 'User Name', key: 'user.name', formatter: (r: any) => r.user?.name || 'System' },
    { header: 'User Email', key: 'user.email', formatter: (r: any) => r.user?.email || 'system@stockpilot.io' },
    { header: 'Action', key: 'action' },
    { header: 'Module', key: 'module' },
    { header: 'Reference', key: 'reference' },
    { header: 'IP Address', key: 'ip' },
  ];

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Activity & Audit Logs"
            description="Immutable operational audit trail recording entity lifecycle events, financial transactions, and configuration updates"
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Activity Logs' }]}
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
                  <span>Refresh</span>
                </button>
              </div>
            }
          />

          <StatCardGrid columns={4}>
            <StatCard
              label="Total Logged Events"
              value={meta.total}
              detail="Recorded system operations"
              icon={<Activity size={20} color="#5068e6" />}
              kind="blue"
            />
            <StatCard
              label="Active Module Filter"
              value={moduleFilter || 'All Modules'}
              detail="Event category scope"
              icon={<Layers size={20} color="#28a476" />}
              kind="green"
            />
            <StatCard
              label="Security Tracking"
              value="Enabled"
              detail="IP & User attribution active"
              icon={<Shield size={20} color="#8e71eb" />}
              kind="blue"
            />
            <StatCard
              label="Current Page"
              value={`${meta.page} / ${meta.totalPages || 1}`}
              detail={`${meta.total} total records`}
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
                placeholder="Search reference, user, action..."
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
                <option value="">All Modules</option>
                <option value="PRODUCTS">Products</option>
                <option value="CATEGORIES">Categories</option>
                <option value="SALES">Sales</option>
                <option value="PURCHASES">Purchases</option>
                <option value="INVENTORY">Inventory</option>
                <option value="CUSTOMERS">Customers</option>
                <option value="SUPPLIERS">Suppliers</option>
                <option value="PAYMENTS">Payments</option>
                <option value="EXPENSES">Expenses</option>
                <option value="SETTINGS">Settings</option>
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
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="CANCEL">CANCEL</option>
                <option value="RETURN">RETURN</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="SETTINGS_CHANGE">SETTINGS CHANGE</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="card table-container">
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#8b94b0' }}>Loading audit records...</div>
            ) : logs.length === 0 ? (
              <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
                <Activity size={36} color="#8b94b0" style={{ margin: '0 auto 10px' }} />
                <h3>No activity records found</h3>
                <p style={{ color: '#8b94b0', fontSize: '0.88rem' }}>No events match the selected search or module filter.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Module</th>
                    <th>Action</th>
                    <th>Reference</th>
                    <th>IP Address</th>
                    <th style={{ textAlign: 'right' }}>Payload</th>
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
                              View JSON
                            </button>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>None</span>
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
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Audit Event Payload</h3>
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
                    Close
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
