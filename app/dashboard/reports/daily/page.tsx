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
import { ShoppingBag, Package, TrendingUp, Coins, Receipt, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const dailyQuery = useQuery({
    queryKey: ['daily-report', selectedDate],
    queryFn: () => api<any>(`/reports/daily?date=${selectedDate}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Daily Operational Report"
            description="Complete operational review of today's sales, purchases, receipts, disbursements, and net earnings."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/dashboard/reports' },
              { label: 'Daily' },
            ]}
            action={
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            }
          />

          {dailyQuery.isLoading ? (
            <LoadingSpinner label="Compiling daily transactions ledger…" />
          ) : dailyQuery.error ? (
            <ErrorState message={dailyQuery.error.message} onRetry={() => dailyQuery.refetch()} />
          ) : (
            <>
              {/* Daily KPI Snapshot */}
              <StatCardGrid columns={4}>
                <StatCard
                  label="Daily Sales Revenue"
                  value={<CurrencyDisplay value={dailyQuery.data.sales.revenue} />}
                  detail={`${dailyQuery.data.sales.orders} orders · ${dailyQuery.data.sales.itemsSold} items sold`}
                  icon={<ShoppingBag color="#5068e6" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label="Cost of Goods (COGS)"
                  value={<CurrencyDisplay value={dailyQuery.data.sales.cogs} />}
                  detail="Inventory cost of goods sold"
                  icon={<Package color="#d28d2b" size={20} />}
                  kind="amber"
                />
                <StatCard
                  label="Gross Profit"
                  value={<CurrencyDisplay value={dailyQuery.data.profit.grossProfit} />}
                  detail="Sales revenue minus COGS"
                  icon={<TrendingUp color="#28a476" size={20} />}
                  kind="green"
                />
                <StatCard
                  label="Net Profit"
                  value={<CurrencyDisplay value={dailyQuery.data.profit.netProfit} />}
                  detail="Gross margin minus expenses"
                  icon={<Coins color={Number(dailyQuery.data.profit.netProfit) >= 0 ? '#28a476' : '#ef4444'} size={20} />}
                  kind={Number(dailyQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
              </StatCardGrid>

              {/* Inward & Cash Flow Breakdown */}
              <div className="grid-2" style={{ marginTop: 10 }}>
                <section className="card">
                  <h3>Daily Inward Procurement</h3>
                  <dl>
                    <dt>Purchase Orders Placed</dt>
                    <dd>
                      <strong>{dailyQuery.data.purchases.orders} orders</strong>
                    </dd>

                    <dt>Items Purchased</dt>
                    <dd>{dailyQuery.data.purchases.itemsPurchased} units</dd>

                    <dt>Total Purchases Value</dt>
                    <dd>
                      <strong style={{ color: '#d28d2b' }}>
                        <CurrencyDisplay value={dailyQuery.data.purchases.total} />
                      </strong>
                    </dd>

                    <dt>Daily Operating Expenses</dt>
                    <dd>
                      <strong style={{ color: '#ef4444' }}>
                        <CurrencyDisplay value={dailyQuery.data.expenses.total} />
                      </strong>{' '}
                      ({dailyQuery.data.expenses.count} expense records)
                    </dd>
                  </dl>
                </section>

                <section className="card">
                  <h3>Daily Cash & Settlement Inflow</h3>
                  <dl>
                    <dt>Customer Collections Received</dt>
                    <dd style={{ color: '#188b64', fontWeight: 700 }}>
                      <ArrowDownLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                      <CurrencyDisplay value={dailyQuery.data.payments.received} />
                    </dd>

                    <dt>Supplier Disbursements Paid</dt>
                    <dd style={{ color: '#ef4444', fontWeight: 700 }}>
                      <ArrowUpRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                      <CurrencyDisplay value={dailyQuery.data.payments.made} />
                    </dd>

                    <dt>Net Cash Position for Date</dt>
                    <dd style={{ fontWeight: 800 }}>
                      <CurrencyDisplay
                        value={Number(dailyQuery.data.payments.received) - Number(dailyQuery.data.payments.made)}
                      />
                    </dd>
                  </dl>
                </section>
              </div>
            </>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
