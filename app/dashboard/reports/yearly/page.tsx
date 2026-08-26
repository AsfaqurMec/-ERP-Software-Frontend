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
import { AppBarChart } from '../../../../components/charts';
import { ShoppingBag, Package, TrendingUp, Coins, Receipt } from 'lucide-react';

export default function YearlyReportPage() {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getFullYear());

  const yearlyQuery = useQuery({
    queryKey: ['yearly-report', year],
    queryFn: () => api<any>(`/reports/yearly?year=${year}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('reports.yearly_title')}
            description={`${t('reports.yearly_desc')} (${year})`}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('reports.title'), href: '/dashboard/reports' },
              { label: t('reports.yearly_title') },
            ]}
            action={
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
            }
          />

          {yearlyQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : yearlyQuery.error ? (
            <ErrorState message={yearlyQuery.error.message} onRetry={() => yearlyQuery.refetch()} />
          ) : (
            <>
              {/* Yearly KPI Snapshot */}
              <StatCardGrid columns={5}>
                <StatCard
                  label={t('reports.sales_revenue')}
                  value={<CurrencyDisplay value={yearlyQuery.data.sales.revenue} />}
                  detail={`${yearlyQuery.data.sales.orders} ${t('sales.orders')}`}
                  icon={<ShoppingBag color="#5068e6" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label={t('reports.purchases_title')}
                  value={<CurrencyDisplay value={yearlyQuery.data.purchases.total} />}
                  detail={`${yearlyQuery.data.purchases.orders} ${t('sales.orders')}`}
                  icon={<Package color="#d28d2b" size={20} />}
                  kind="amber"
                />
                <StatCard
                  label={t('reports.cogs')}
                  value={<CurrencyDisplay value={yearlyQuery.data.sales.cogs} />}
                  detail={t('reports.cogs_detail')}
                  icon={<Package color="#71798d" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label={t('expenses.title')}
                  value={<CurrencyDisplay value={yearlyQuery.data.expenses.total} />}
                  detail={`${yearlyQuery.data.expenses.count}`}
                  icon={<Receipt color="#ef4444" size={20} />}
                  kind="rose"
                />
                <StatCard
                  label={t('reports.net_profit')}
                  value={<CurrencyDisplay value={yearlyQuery.data.profit.netProfit} />}
                  detail={t('reports.net_profit_detail')}
                  icon={<Coins color="#28a476" size={20} />}
                  kind={Number(yearlyQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
              </StatCardGrid>

              {/* Monthly Comparison Bar Chart */}
              <div style={{ marginTop: 16 }}>
                <ChartCard
                  title={`${t('dashboard.revenue_performance')} (${year})`}
                  subtitle={t('reports.period_summary_desc')}
                >
                  <AppBarChart
                    data={yearlyQuery.data.monthlyComparison.map((m: any) => ({
                      name: m.month,
                      sales: m.sales,
                      profit: m.profit,
                    }))}
                    dataKeys={[
                      { key: 'sales', color: '#5068e6', label: t('dashboard.revenue') },
                      { key: 'profit', color: '#28a476', label: t('dashboard.profit') },
                    ]}
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
