'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import { useTranslation } from '../../../../provider';
import {
  CurrencyDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  ChartCard,
  ErrorState,
} from '../../../../components/ui';
import { AppAreaChart } from '../../../../components/charts';
import { ShoppingBag, Package, TrendingUp, Coins, Users, Receipt } from 'lucide-react';

export default function MonthlyReportPage() {
  const { t } = useTranslation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthlyQuery = useQuery({
    queryKey: ['monthly-report', year, month],
    queryFn: () => api<any>(`/reports/monthly?year=${year}&month=${month}`),
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('reports.monthly_title')}
            description={`${t('reports.monthly_desc')} (${monthNames[month - 1]} ${year})`}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('reports.title'), href: '/dashboard/reports' },
              { label: t('reports.monthly_title') },
            ]}
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            }
          />

          {monthlyQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : monthlyQuery.error ? (
            <ErrorState message={monthlyQuery.error.message} onRetry={() => monthlyQuery.refetch()} />
          ) : (
            <>
              {/* Core Metric Cards */}
              <StatCardGrid columns={6}>
                <StatCard
                  label={t('reports.sales_revenue')}
                  value={<CurrencyDisplay value={monthlyQuery.data.sales.revenue} />}
                  detail={`${monthlyQuery.data.sales.orders} ${t('sales.orders')}`}
                  icon={<ShoppingBag color="#5068e6" size={18} />}
                  kind="blue"
                />
                <StatCard
                  label={t('reports.cogs')}
                  value={<CurrencyDisplay value={monthlyQuery.data.sales.cogs} />}
                  detail={t('reports.cogs_detail')}
                  icon={<Package color="#d28d2b" size={18} />}
                  kind="amber"
                />
                <StatCard
                  label={t('reports.gross_profit')}
                  value={<CurrencyDisplay value={monthlyQuery.data.profit.grossProfit} />}
                  detail={t('reports.gross_profit_detail')}
                  icon={<TrendingUp color="#28a476" size={18} />}
                  kind="green"
                />
                <StatCard
                  label={t('expenses.title')}
                  value={<CurrencyDisplay value={monthlyQuery.data.expenses.total} />}
                  detail={`${monthlyQuery.data.expenses.count}`}
                  icon={<Receipt color="#ef4444" size={18} />}
                  kind="rose"
                />
                <StatCard
                  label={t('reports.net_profit')}
                  value={<CurrencyDisplay value={monthlyQuery.data.profit.netProfit} />}
                  detail={t('reports.net_profit_detail')}
                  icon={<Coins color="#28a476" size={18} />}
                  kind={Number(monthlyQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
                <StatCard
                  label={t('customers.title')}
                  value={monthlyQuery.data.sales.customers}
                  detail={`${monthlyQuery.data.sales.itemsSold} ${t('products.units')}`}
                  icon={<Users color="#5068e6" size={18} />}
                  kind="blue"
                />
              </StatCardGrid>

              {/* Daily Trend Curve */}
              <div style={{ marginTop: 16 }}>
                <ChartCard
                  title={`${t('dashboard.revenue_performance')} (${monthNames[month - 1]} ${year})`}
                  subtitle={t('reports.period_summary_desc')}
                >
                  <AppAreaChart
                    data={
                      monthlyQuery.data.dailyTrend?.length
                        ? monthlyQuery.data.dailyTrend.map((d: any) => ({
                            label: `Day ${d.date.slice(8)}`,
                            Sales: d.sales,
                            Profit: d.profit,
                          }))
                        : [{ label: 'No data', Sales: 0, Profit: 0 }]
                    }
                    dataKey="Sales"
                    strokeColor="#5068e6"
                    fillColor="#5068e6"
                  />
                </ChartCard>
              </div>
            </>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
