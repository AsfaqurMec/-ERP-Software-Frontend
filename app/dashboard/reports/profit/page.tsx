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

export default function ProfitReportPage() {
  const { t } = useTranslation();
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
            title={t('reports.profit_title')}
            description={t('reports.profit_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('reports.title'), href: '/dashboard/reports' },
              { label: t('reports.profit_title') },
            ]}
            action={
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
                <span style={{ color: '#94a3b8' }}>{t('reports.to_date')}</span>
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
            <LoadingSpinner label={t('common.loading')} />
          ) : profitQuery.error ? (
            <ErrorState message={profitQuery.error.message} onRetry={() => profitQuery.refetch()} />
          ) : (
            <>
              <StatCardGrid columns={4}>
                <StatCard
                  label={t('reports.sales_revenue')}
                  value={<CurrencyDisplay value={profitQuery.data.sales.revenue} />}
                  detail={`${profitQuery.data.sales.orders} ${t('sales.orders')}`}
                  kind="blue"
                />
                <StatCard
                  label={t('reports.cogs')}
                  value={<CurrencyDisplay value={profitQuery.data.sales.cogs} />}
                  detail={t('reports.cogs_detail')}
                  kind="amber"
                />
                <StatCard
                  label={t('reports.gross_profit')}
                  value={<CurrencyDisplay value={profitQuery.data.profit.grossProfit} />}
                  detail={t('reports.gross_profit_detail')}
                  kind="green"
                />
                <StatCard
                  label={t('reports.net_profit')}
                  value={<CurrencyDisplay value={profitQuery.data.profit.netProfit} />}
                  detail={t('reports.net_profit_detail')}
                  kind={Number(profitQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                />
              </StatCardGrid>

              <section className="card" style={{ marginTop: 16 }}>
                <div className="card-head">
                  <div>
                    <h3>{t('reports.financial_income_statement')}</h3>
                    <p>
                      {t('reports.reporting_period')}: <strong>{from}</strong> {t('reports.to_date')} <strong>{to}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 0 }}>
                  <div className="row" style={{ fontSize: 15, padding: '12px 14px' }}>
                    <span>{t('reports.gross_sales_revenue')}</span>
                    <strong style={{ color: '#5068e6' }}>
                      <CurrencyDisplay value={profitQuery.data.sales.revenue} />
                    </strong>
                  </div>

                  <div className="row" style={{ fontSize: 15, padding: '12px 14px' }}>
                    <span>{t('reports.less_cogs')}</span>
                    <strong style={{ color: '#ef4444' }}>
                      - <CurrencyDisplay value={profitQuery.data.sales.cogs} />
                    </strong>
                  </div>

                  <div className="row emphasis" style={{ fontSize: 16, padding: '14px', background: '#f8fafc' }}>
                    <strong>{t('reports.gross_profit')}</strong>
                    <strong style={{ color: '#188b64' }}>
                      <CurrencyDisplay value={profitQuery.data.profit.grossProfit} />
                    </strong>
                  </div>

                  <div className="row" style={{ fontSize: 15, padding: '12px 14px' }}>
                    <span>{t('reports.less_expenses')} ({profitQuery.data.expenses.count})</span>
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
                      {t('reports.net_profit')}
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
