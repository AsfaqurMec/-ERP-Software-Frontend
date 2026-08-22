'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Coins,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  Archive,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { CurrencyDisplay, PageContainer, PageHeader, StatCard, StatCardGrid } from '../../../components/ui';
import { api } from '../../../lib/api';

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RECEIVABLES' | 'PAYABLES' | 'STOCK' | 'DEAD_STOCK' | 'CRITICAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<any>('/notifications'),
  });

  const alerts = data?.alerts || [];
  const summary = data?.summary || {
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    customerDue: { count: 0, totalAmount: 0 },
    supplierDue: { count: 0, totalAmount: 0 },
    lowStock: { totalCount: 0, outOfStockCount: 0, lowStockCount: 0 },
    deadStock: { count: 0, totalValue: 0 },
  };

  const filteredAlerts = alerts.filter((a: any) => {
    if (activeFilter === 'CRITICAL' && a.severity !== 'CRITICAL') return false;
    if (activeFilter === 'STOCK' && a.type !== 'LOW_STOCK' && a.type !== 'OUT_OF_STOCK') return false;
    if (activeFilter === 'RECEIVABLES' && a.type !== 'CUSTOMER_OVERDUE') return false;
    if (activeFilter === 'PAYABLES' && a.type !== 'SUPPLIER_DUE') return false;
    if (activeFilter === 'DEAD_STOCK' && a.type !== 'DEAD_STOCK') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        (a.actionLabel && a.actionLabel.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="System Alerts & Notifications"
            description="Dynamic real-time monitor for customer dues, supplier payables, low inventory limits, and dead stock."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
            action={
              <button
                type="button"
                className="ghost"
                onClick={() => refetch()}
                disabled={isRefetching}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              >
                <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
                <span>{isRefetching ? 'Syncing…' : 'Refresh Alerts'}</span>
              </button>
            }
          />

          {/* 4 Core Dynamic Stat Cards */}
          <StatCardGrid columns={4}>
            <div
              onClick={() => setActiveFilter('RECEIVABLES')}
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            >
              <StatCard
                label="Customer Due"
                value={<CurrencyDisplay value={summary.customerDue.totalAmount} />}
                detail={`${summary.customerDue.count} sales orders awaiting collection`}
                icon={<ArrowDownLeft size={20} color="#d28d2b" />}
                kind="amber"
              />
            </div>

            <div
              onClick={() => setActiveFilter('PAYABLES')}
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            >
              <StatCard
                label="Supplier Due"
                value={<CurrencyDisplay value={summary.supplierDue.totalAmount} />}
                detail={`${summary.supplierDue.count} purchase orders pending payment`}
                icon={<ArrowUpRight size={20} color="#ef4444" />}
                kind="rose"
              />
            </div>

            <div
              onClick={() => setActiveFilter('STOCK')}
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            >
              <StatCard
                label="Low Stock"
                value={`${summary.lowStock.totalCount} Products`}
                detail={`${summary.lowStock.outOfStockCount} out of stock · ${summary.lowStock.lowStockCount} low threshold`}
                icon={<Package size={20} color="#d28d2b" />}
                kind={summary.lowStock.outOfStockCount > 0 ? 'rose' : 'amber'}
              />
            </div>

            <div
              onClick={() => setActiveFilter('DEAD_STOCK')}
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            >
              <StatCard
                label="Dead Stock"
                value={`${summary.deadStock.count} Products`}
                detail={`Valuation: ৳ ${Number(summary.deadStock.totalValue).toLocaleString('en-BD')} (no sales 90d+)`}
                icon={<Archive size={20} color="#5068e6" />}
                kind="blue"
              />
            </div>
          </StatCardGrid>

          {/* Dynamic Filter Navigation */}
          <div
            className="card"
            style={{
              marginTop: 16,
              marginBottom: 16,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: `All Alerts (${summary.total})` },
                { id: 'RECEIVABLES', label: `Customer Due (${summary.customerDue.count})` },
                { id: 'PAYABLES', label: `Supplier Due (${summary.supplierDue.count})` },
                { id: 'STOCK', label: `Low Stock (${summary.lowStock.totalCount})` },
                { id: 'DEAD_STOCK', label: `Dead Stock (${summary.deadStock.count})` },
                { id: 'CRITICAL', label: `Critical (${summary.critical})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={activeFilter === tab.id ? 'primary' : 'ghost'}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    borderRadius: 8,
                    fontWeight: activeFilter === tab.id ? 700 : 500,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fc', padding: '8px 14px', borderRadius: 8, minWidth: 260 }}>
              <Search size={15} color="#8b94b0" />
              <input
                type="text"
                placeholder="Search alerts, items, customers…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 0,
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: '#1a2238',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Dynamic Alerts List */}
          {isLoading ? (
            <div className="card skeleton-row" style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#8b94b0' }}>Scanning system for live operational alerts…</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="card empty-state" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <CheckCircle2 size={44} color="#28a476" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 18, color: '#1e293b' }}>All Systems Healthy</h3>
              <p style={{ color: '#8b94b0', maxWidth: 460, margin: '6px auto 0', fontSize: 13 }}>
                There are no active alerts matching your current filter. Dues, payables, and inventory thresholds are fully aligned.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredAlerts.map((alert: any) => {
                let badgeBg = '#f1f5f9';
                let badgeColor = '#475569';
                let borderAccent = '#cbd5e1';

                if (alert.severity === 'CRITICAL') {
                  badgeBg = '#fee2e2';
                  badgeColor = '#dc2626';
                  borderAccent = '#ef4444';
                } else if (alert.severity === 'WARNING') {
                  badgeBg = '#fef3c7';
                  badgeColor = '#b45309';
                  borderAccent = '#f59e0b';
                } else if (alert.severity === 'INFO') {
                  badgeBg = '#e0e7ff';
                  badgeColor = '#4338ca';
                  borderAccent = '#6366f1';
                }

                return (
                  <div
                    key={alert.id}
                    className="card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `4px solid ${borderAccent}`,
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          background: badgeBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {alert.type === 'OUT_OF_STOCK' || alert.type === 'LOW_STOCK' ? (
                          <Package size={18} color={badgeColor} />
                        ) : alert.type === 'CUSTOMER_OVERDUE' ? (
                          <Coins size={18} color={badgeColor} />
                        ) : alert.type === 'SUPPLIER_DUE' ? (
                          <Coins size={18} color={badgeColor} />
                        ) : alert.type === 'DEAD_STOCK' ? (
                          <Archive size={18} color={badgeColor} />
                        ) : (
                          <ShieldAlert size={18} color={badgeColor} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1a2238' }}>{alert.title}</h4>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a647e', lineHeight: 1.4 }}>{alert.message}</p>
                      </div>
                    </div>

                    <Link
                      href={alert.actionUrl}
                      className="primary-button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        textDecoration: 'none',
                        flexShrink: 0,
                        padding: '8px 14px',
                        fontSize: '0.83rem',
                      }}
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
