'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import {
  CurrencyDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  ErrorState,
} from '../../../../components/ui';

export default function ProfitReportPage() {
  const [from, setFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const profitQuery = useQuery({
    queryKey: ['profit-report', from, to],
    queryFn: () => api<any>(`/reports/summary?from=${from}&to=${to}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Profit & Loss Statement (P&L)"
            description="Clear separation of Gross Revenue, Inventory COGS, Operating Expenses and Net Profit."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/dashboard/reports' },
              { label: 'Profit' },
            ]}
            action={
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                <span style={{ color: '#94a3b8' }}>to</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
            }
          />

          {profitQuery.isLoading ? (
            <LoadingSpinner label="Compiling Profit & Loss statement…" />
          ) : profitQuery.error ? (
            <ErrorState message={profitQuery.error.message} onRetry={() => profitQuery.refetch()} />
          ) : (
            <>
              <StatCardGrid columns={4}>
                <StatCard
                  label="Gross Sales Revenue"
                  value={<CurrencyDisplay value={profitQuery.data.sales.revenue} />}
                  detail={`${profitQuery.data.sales.orders} confirmed orders`}
                  kind="blue"
                />
                <StatCard
                  label="Cost of Goods Sold (COGS)"
                  value={<CurrencyDisplay value={profitQuery.data.sales.cogs} />}
                  detail="Weighted Average Costing"
                  kind="amber"
                />
                <StatCard
                  label="Gross Operating Margin"
                  value={<CurrencyDisplay value={profitQuery.data.profit.grossProfit} />}
                  detail="Revenue minus COGS"
                  kind="green"
                />
                <StatCard
                  label="Net Operating Profit"
                  value={<CurrencyDisplay value={profitQuery.data.profit.netProfit} />}
                  detail="Gross margin minus expenses"
                  kind={Number(profitQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
              </StatCardGrid>

              <section className="card" style={{ marginTop: 16 }}>
                <div className="card-head">
                  <div>
                    <h3>Financial Income Statement Breakdown</h3>
                    <p>
                      Reporting Period: <strong>{from}</strong> to <strong>{to}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 0 }}>
                  <div className="row" style={{ fontSize: 15, padding: '12px 14px' }}>
                    <span>Gross Sales Revenue (Confirmed Orders)</span>
                    <strong style={{ color: '#5068e6' }}>
                      <CurrencyDisplay value={profitQuery.data.sales.revenue} />
                    </strong>
                  </div>

                  <div className="row" style={{ fontSize: 15, padding: '12px 14px' }}>
                    <span>Less: Cost of Goods Sold (COGS based on WAC)</span>
                    <strong style={{ color: '#ef4444' }}>
                      - <CurrencyDisplay value={profitQuery.data.sales.cogs} />
                    </strong>
                  </div>

                  <div className="row emphasis" style={{ fontSize: 16, padding: '14px', background: '#f8fafc' }}>
                    <strong>Gross Operating Profit</strong>
                    <strong style={{ color: '#188b64' }}>
                      <CurrencyDisplay value={profitQuery.data.profit.grossProfit} />
                    </strong>
                  </div>

                  <div className="row" style={{ fontSize: 15, padding: '12px 14px' }}>
                    <span>Less: Operating Expenses ({profitQuery.data.expenses.count} expense records)</span>
                    <strong style={{ color: '#ef4444' }}>
                      - <CurrencyDisplay value={profitQuery.data.expenses.total} />
                    </strong>
                  </div>

                  <div
                    className="row emphasis"
                    style={{
                      fontSize: 18,
                      padding: '16px 14px',
                      background: Number(profitQuery.data.profit.netProfit) >= 0 ? '#e8faf0' : '#fff0f1',
                    }}
                  >
                    <strong style={{ color: Number(profitQuery.data.profit.netProfit) >= 0 ? '#188b64' : '#ef4444' }}>
                      Net Operating Profit (Bottom Line)
                    </strong>
                    <strong style={{ color: Number(profitQuery.data.profit.netProfit) >= 0 ? '#188b64' : '#ef4444' }}>
                      <CurrencyDisplay value={profitQuery.data.profit.netProfit} />
                    </strong>
                  </div>
                </div>
              </section>
            </>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
