'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DateDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  StatusBadge,
  ErrorState,
} from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function CustomerDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const customerQuery = useQuery({
    queryKey: ['customer-detail', id],
    queryFn: () => api<any>(`/customers/${id}`),
  });

  if (customerQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label={t('common.loading')} />
        </Shell>
      </AuthGuard>
    );
  }

  if (customerQuery.error) {
    return (
      <AuthGuard>
        <Shell>
          <ErrorState message={customerQuery.error.message} onRetry={() => customerQuery.refetch()} />
        </Shell>
      </AuthGuard>
    );
  }

  const c = customerQuery.data;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={c.name}
            description={`${t('customers.customer_info')} · ${t('common.phone')}: ${c.phone || '—'}`}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('customers.title'), href: '/dashboard/customers' },
              { label: c.name },
            ]}
            action={
              <Link className="primary-button" href={`/dashboard/customers/${id}/edit`}>
                {t('customers.edit_customer')}
              </Link>
            }
          />

          <StatCardGrid columns={5}>
            <StatCard
              label={t('reports.sales_revenue')}
              value={<CurrencyDisplay value={c.summary.totalSales} />}
              detail={`${c.summary.salesCount} ${t('sales.title')}`}
              kind="blue"
            />
            <StatCard
              label={t('payments.total_received')}
              value={<CurrencyDisplay value={c.summary.totalPaid} />}
              detail={`${c.summary.paymentCount} ${t('payments.title')}`}
              kind="green"
            />
            <StatCard
              label={t('customers.total_due')}
              value={<CurrencyDisplay value={c.summary.totalDue} />}
              detail={t('dues.receivable')}
              kind="rose"
            />
            <StatCard
              label={t('sales.returns_title')}
              value={<CurrencyDisplay value={c.summary.totalReturns || 0} />}
              detail={t('sales.returns_title')}
              kind="amber"
            />
            <StatCard label={t('common.status')} value={<StatusBadge value={c.status} />} kind="neutral" />
          </StatCardGrid>

          <div className="detail-grid">
            <section className="card">
              <h3>{t('customers.customer_info')}</h3>
              <dl>
                <dt>{t('customers.customer_name')}</dt>
                <dd>
                  <strong>{c.name}</strong>
                </dd>

                <dt>{t('common.phone')}</dt>
                <dd>{c.phone || '—'}</dd>

                <dt>{t('common.email')}</dt>
                <dd>{c.email || '—'}</dd>

                <dt>{t('customers.opening_balance')}</dt>
                <dd>
                  <CurrencyDisplay value={c.openingBalance} />
                </dd>

                <dt>{t('common.address')}</dt>
                <dd style={{ gridColumn: 'span 2' }}>{c.address || '—'}</dd>

                <dt>{t('customers.customer_notes')}</dt>
                <dd style={{ gridColumn: 'span 2' }}>{c.notes || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <h3>{t('payments.title')}</h3>
              <DataTable columns={[t('common.date'), t('common.amount'), t('common.payment_method'), t('activity_logs.reference')]}>
                {c.payments && c.payments.length ? (
                  c.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <DateDisplay value={p.date} />
                      </td>
                      <td>
                        <strong>
                          <CurrencyDisplay value={p.amount} />
                        </strong>
                      </td>
                      <td>
                        <StatusBadge value={p.method} />
                      </td>
                      <td>{p.reference || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty">
                      {t('payments.no_payments')}
                    </td>
                  </tr>
                )}
              </DataTable>
            </section>
          </div>

          <section className="card">
            <div className="card-head">
              <div>
                <h3>{t('sales.title')}</h3>
                <p>{t('sales.invoice_number')}</p>
              </div>
            </div>
            <DataTable
              columns={[
                t('sales.invoice_number'),
                t('common.date'),
                t('common.total'),
                t('sales.paid_amount'),
                t('sales.due_amount'),
                t('common.status'),
                t('common.actions'),
              ]}
            >
              {c.sales && c.sales.length ? (
                c.sales.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.invoiceNumber}</strong>
                    </td>
                    <td>
                      <DateDisplay value={s.saleDate} />
                    </td>
                    <td>
                      <CurrencyDisplay value={s.grandTotal} />
                    </td>
                    <td>
                      <CurrencyDisplay value={s.paidAmount} />
                    </td>
                    <td>
                      <span style={{ color: Number(s.dueAmount) > 0 ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                        <CurrencyDisplay value={s.dueAmount} />
                      </span>
                    </td>
                    <td>
                      <StatusBadge value={s.status} />
                    </td>
                    <td>
                      <Link href={`/dashboard/sales/${s.id}`}>{t('common.view')}</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty">
                    {t('sales.no_sales_found')}
                  </td>
                </tr>
              )}
            </DataTable>
          </section>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
