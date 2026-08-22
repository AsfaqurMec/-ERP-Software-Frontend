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
  ChartCard,
  ErrorState,
} from '../../../../components/ui';
import { AppBarChart } from '../../../../components/charts';
import { ShoppingBag, Package, TrendingUp, Coins, Receipt } from 'lucide-react';

export default function YearlyReportPage() {
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
            title="Yearly Annual Performance"
            description={`Executive annual review of revenue, procurement, operational expenses and net margins for fiscal ${year}.`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/dashboard/reports' },
              { label: 'Yearly' },
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
            <LoadingSpinner label="Compiling annual accounting reports…" />
          ) : yearlyQuery.error ? (
            <ErrorState message={yearlyQuery.error.message} onRetry={() => yearlyQuery.refetch()} />
          ) : (
            <>
              {/* Yearly KPI Snapshot */}
              <StatCardGrid columns={5}>
                <StatCard
                  label="Annual Revenue"
                  value={<CurrencyDisplay value={yearlyQuery.data.sales.revenue} />}
                  detail={`${yearlyQuery.data.sales.orders} confirmed orders`}
                  icon={<ShoppingBag color="#5068e6" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label="Annual Purchases"
                  value={<CurrencyDisplay value={yearlyQuery.data.purchases.total} />}
                  detail={`${yearlyQuery.data.purchases.orders} purchase orders`}
                  icon={<Package color="#d28d2b" size={20} />}
                  kind="amber"
                />
                <StatCard
                  label="Annual COGS"
                  value={<CurrencyDisplay value={yearlyQuery.data.sales.cogs} />}
                  detail="Cost of goods sold"
                  icon={<Package color="#71798d" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label="Annual Expenses"
                  value={<CurrencyDisplay value={yearlyQuery.data.expenses.total} />}
                  detail={`${yearlyQuery.data.expenses.count} expense records`}
                  icon={<Receipt color="#ef4444" size={20} />}
                  kind="rose"
                />
                <StatCard
                  label="Annual Net Profit"
                  value={<CurrencyDisplay value={yearlyQuery.data.profit.netProfit} />}
                  detail="Bottom line net margin"
                  icon={<Coins color="#28a476" size={20} />}
                  kind={Number(yearlyQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
              </StatCardGrid>

              {/* Monthly Comparison Bar Chart */}
              <div style={{ marginTop: 16 }}>
                <ChartCard
                  title={`Monthly Sales vs Profit Breakdown (Fiscal ${year})`}
                  subtitle="Monthly comparative analysis over 12 months"
                >
                  <AppBarChart
                    data={yearlyQuery.data.monthlyComparison.map((m: any) => ({
                      name: m.month,
                      sales: m.sales,
                      profit: m.profit,
                    }))}
                    dataKeys={[
                      { key: 'sales', color: '#5068e6', label: 'Sales Revenue' },
                      { key: 'profit', color: '#28a476', label: 'Gross Margin' },
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
