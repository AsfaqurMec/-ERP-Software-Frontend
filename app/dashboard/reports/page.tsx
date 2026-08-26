'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
import { useTranslation } from '../../../provider';
import {
  CurrencyDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  ErrorState,
} from '../../../components/ui';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  ShoppingCart,
  PackagePlus,
  Boxes,
  ArrowRight,
} from 'lucide-react';

export default function ReportsHubPage() {
  const { t } = useTranslation();
  const [customFrom, setCustomFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));

  const reportQuery = useQuery({
    queryKey: ['summary-report', customFrom, customTo],
    queryFn: () => api<any>(`/reports/summary?from=${customFrom}&to=${customTo}`),
  });

  const reportLinks = [
    {
      title: t('reports.daily_title'),
      desc: t('reports.daily_desc'),
      href: '/dashboard/reports/daily',
      icon: <Calendar color="#5068e6" size={24} />,
    },
    {
      title: t('reports.monthly_title'),
      desc: t('reports.monthly_desc'),
      href: '/dashboard/reports/monthly',
      icon: <CalendarDays color="#28a476" size={24} />,
    },
    {
      title: t('reports.yearly_title'),
      desc: t('reports.yearly_desc'),
      href: '/dashboard/reports/yearly',
      icon: <CalendarRange color="#d28d2b" size={24} />,
    },
    {
      title: t('reports.sales_title'),
      desc: t('reports.sales_desc'),
      href: '/dashboard/reports/sales',
      icon: <ShoppingCart color="#5068e6" size={24} />,
    },
    {
      title: t('reports.purchases_title'),
      desc: t('reports.purchases_desc'),
      href: '/dashboard/reports/purchases',
      icon: <PackagePlus color="#d28d2b" size={24} />,
    },
    {
      title: t('reports.profit_title'),
      desc: t('reports.profit_desc'),
      href: '/dashboard/reports/profit',
      icon: <TrendingUp color="#28a476" size={24} />,
    },
    {
      title: t('reports.inventory_title'),
      desc: t('reports.inventory_desc'),
      href: '/dashboard/reports/inventory',
      icon: <Boxes color="#5068e6" size={24} />,
    },
  ];

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('reports.title')}
            description={t('reports.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('reports.title') }]}
          />

          {/* Quick Nav Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
            {reportLinks.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: 20,
                  background: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ padding: 10, borderRadius: 10, background: '#f8fafc' }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>{r.title}</h3>
                    <ArrowRight size={16} color="#94a3b8" />
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Date-Range Executive Summary */}
          <section className="card">
            <div className="card-head">
              <div>
                <h3>{t('reports.period_summary')}</h3>
                <p>{t('reports.period_summary_desc')}</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                <span style={{ color: '#94a3b8' }}>{t('reports.to_date')}</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
            </div>

            {reportQuery.isLoading ? (
              <LoadingSpinner label={t('common.loading')} />
            ) : reportQuery.error ? (
              <ErrorState message={reportQuery.error.message} onRetry={() => reportQuery.refetch()} />
            ) : (
              <>
                <StatCardGrid columns={4}>
                  <StatCard
                    label={t('reports.sales_revenue')}
                    value={<CurrencyDisplay value={reportQuery.data.sales.revenue} />}
                    detail={`${reportQuery.data.sales.orders} ${t('sales.orders')}`}
                    kind="blue"
                  />
                  <StatCard
                    label={t('reports.cogs')}
                    value={<CurrencyDisplay value={reportQuery.data.sales.cogs} />}
                    detail={t('reports.cogs_detail')}
                    kind="amber"
                  />
                  <StatCard
                    label={t('reports.gross_profit')}
                    value={<CurrencyDisplay value={reportQuery.data.profit.grossProfit} />}
                    detail={t('reports.gross_profit_detail')}
                    kind="green"
                  />
                  <StatCard
                    label={t('reports.net_profit')}
                    value={<CurrencyDisplay value={reportQuery.data.profit.netProfit} />}
                    detail={t('reports.net_profit_detail')}
                    kind={Number(reportQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                  />
                </StatCardGrid>
              </>
            )}
          </section>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
