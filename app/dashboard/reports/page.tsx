'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
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
      title: 'Daily Operational Report',
      desc: "Today's sales revenue, procurement expenses, stock count changes and cash collections.",
      href: '/dashboard/reports/daily',
      icon: <Calendar color="#5068e6" size={24} />,
    },
    {
      title: 'Monthly Statement & Trends',
      desc: 'Monthly revenue, gross margins, operating expenses, customer counts and daily trend curves.',
      href: '/dashboard/reports/monthly',
      icon: <CalendarDays color="#28a476" size={24} />,
    },
    {
      title: 'Yearly Annual Performance',
      desc: 'Annual business performance, annual revenue, COGS and monthly comparison charts.',
      href: '/dashboard/reports/yearly',
      icon: <CalendarRange color="#d28d2b" size={24} />,
    },
    {
      title: 'Sales & Revenue Report',
      desc: 'Detailed breakdown of confirmed invoices, line item volume and customer accounts.',
      href: '/dashboard/reports/sales',
      icon: <ShoppingCart color="#5068e6" size={24} />,
    },
    {
      title: 'Procurement & Purchases Report',
      desc: 'Inward purchase orders, supplier fulfillment volume and procurement cost audits.',
      href: '/dashboard/reports/purchases',
      icon: <PackagePlus color="#d28d2b" size={24} />,
    },
    {
      title: 'Profit & Loss Statement (P&L)',
      desc: 'Gross revenue, inventory COGS, operational expenses and bottom-line net profit.',
      href: '/dashboard/reports/profit',
      icon: <TrendingUp color="#28a476" size={24} />,
    },
    {
      title: 'Inventory Valuation Report',
      desc: 'Asset valuations by Weighted Average Cost (WAC), reorder alerts and stock quantities.',
      href: '/dashboard/reports/inventory',
      icon: <Boxes color="#5068e6" size={24} />,
    },
  ];

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Management Reports Hub"
            description="Comprehensive financial reporting, performance statements, and executive summaries."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
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
                <h3>Period Summary Overview</h3>
                <p>Filter custom reporting intervals to review financial performance</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                <span style={{ color: '#94a3b8' }}>to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
            </div>

            {reportQuery.isLoading ? (
              <LoadingSpinner label="Aggregating period metrics…" />
            ) : reportQuery.error ? (
              <ErrorState message={reportQuery.error.message} onRetry={() => reportQuery.refetch()} />
            ) : (
              <>
                <StatCardGrid columns={4}>
                  <StatCard
                    label="Sales Revenue"
                    value={<CurrencyDisplay value={reportQuery.data.sales.revenue} />}
                    detail={`${reportQuery.data.sales.orders} orders`}
                    kind="blue"
                  />
                  <StatCard
                    label="Cost of Goods (COGS)"
                    value={<CurrencyDisplay value={reportQuery.data.sales.cogs} />}
                    detail="Inventory cost of sales"
                    kind="amber"
                  />
                  <StatCard
                    label="Gross Operating Margin"
                    value={<CurrencyDisplay value={reportQuery.data.profit.grossProfit} />}
                    detail="Revenue minus COGS"
                    kind="green"
                  />
                  <StatCard
                    label="Net Operating Margin"
                    value={<CurrencyDisplay value={reportQuery.data.profit.netProfit} />}
                    detail="After operational expenses"
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
