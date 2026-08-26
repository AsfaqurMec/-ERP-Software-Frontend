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
  ErrorState,
} from '../../../../components/ui';
import { ShoppingBag, Package, TrendingUp, Coins, Receipt, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function DailyReportPage() {
  const { t } = useTranslation();
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
            title={t('reports.daily_title')}
            description={t('reports.daily_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('reports.title'), href: '/dashboard/reports' },
              { label: t('reports.daily_title') },
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
            <LoadingSpinner label={t('common.loading')} />
          ) : dailyQuery.error ? (
            <ErrorState message={dailyQuery.error.message} onRetry={() => dailyQuery.refetch()} />
          ) : (
            <>
              {/* Daily KPI Snapshot */}
              <StatCardGrid columns={4}>
                <StatCard
                  label={t('reports.daily_sales_revenue')}
                  value={<CurrencyDisplay value={dailyQuery.data.sales.revenue} />}
                  detail={`${dailyQuery.data.sales.orders} ${t('sales.orders')}`}
                  icon={<ShoppingBag color="#5068e6" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label={t('reports.cogs')}
                  value={<CurrencyDisplay value={dailyQuery.data.sales.cogs} />}
                  detail={t('reports.cogs_detail')}
                  icon={<Package color="#d28d2b" size={20} />}
                  kind="amber"
                />
                <StatCard
                  label={t('reports.gross_profit')}
                  value={<CurrencyDisplay value={dailyQuery.data.profit.grossProfit} />}
                  detail={t('reports.gross_profit_detail')}
                  icon={<TrendingUp color="#28a476" size={20} />}
                  kind="green"
                />
                <StatCard
                  label={t('reports.net_profit')}
                  value={<CurrencyDisplay value={dailyQuery.data.profit.netProfit} />}
                  detail={t('reports.net_profit_detail')}
                  icon={<Coins color={Number(dailyQuery.data.profit.netProfit) >= 0 ? '#28a476' : '#ef4444'} size={20} />}
                  kind={Number(dailyQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
              </StatCardGrid>

              {/* Inward & Cash Flow Breakdown */}
              <div className="grid-2" style={{ marginTop: 10 }}>
                <section className="card">
                  <h3>{t('reports.daily_procurement')}</h3>
                  <dl>
                    <dt>{t('reports.purchases_title')}</dt>
                    <dd>
                      <strong>{dailyQuery.data.purchases.orders} {t('sales.orders')}</strong>
                    </dd>

                    <dt>{t('dashboard.units_in_stock')}</dt>
                    <dd>{dailyQuery.data.purchases.itemsPurchased} {t('products.units')}</dd>

                    <dt>{t('purchases.grand_total')}</dt>
                    <dd>
                      <strong style={{ color: '#d28d2b' }}>
                        <CurrencyDisplay value={dailyQuery.data.purchases.total} />
                      </strong>
                    </dd>

                    <dt>{t('expenses.title')}</dt>
                    <dd>
                      <strong style={{ color: '#ef4444' }}>
                        <CurrencyDisplay value={dailyQuery.data.expenses.total} />
                      </strong>{' '}
                      ({dailyQuery.data.expenses.count})
                    </dd>
                  </dl>
                </section>

                <section className="card">
                  <h3>{t('reports.daily_cashflow')}</h3>
                  <dl>
                    <dt>{t('payments.customer_collections')}</dt>
                    <dd style={{ color: '#188b64', fontWeight: 700 }}>
                      <ArrowDownLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                      <CurrencyDisplay value={dailyQuery.data.payments.received} />
                    </dd>

                    <dt>{t('payments.supplier_disbursements')}</dt>
                    <dd style={{ color: '#ef4444', fontWeight: 700 }}>
                      <ArrowUpRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                      <CurrencyDisplay value={dailyQuery.data.payments.made} />
                    </dd>

                    <dt>{t('reports.net_cash_position')}</dt>
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
