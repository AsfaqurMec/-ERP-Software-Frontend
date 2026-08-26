'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import { useTranslation } from '../../../../provider';
import {
  CurrencyDisplay,
  DataTable,
  DateDisplay,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  PaymentStatusBadge,
  ErrorState,
} from '../../../../components/ui';

export default function SalesReportPage() {
  const { t } = useTranslation();
  const [from, setFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const salesReportQuery = useQuery({
    queryKey: ['sales-report', from, to],
    queryFn: () => api<any>(`/reports/sales?from=${from}&to=${to}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('reports.sales_title')}
            description={t('reports.sales_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('reports.title'), href: '/dashboard/reports' },
              { label: t('sales.title') },
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

          {salesReportQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : salesReportQuery.error ? (
            <ErrorState message={salesReportQuery.error.message} onRetry={() => salesReportQuery.refetch()} />
          ) : (
            <DataTable
              columns={[
                t('sales.invoice_number'),
                t('common.date'),
                t('sales.customer'),
                t('products.units'),
                t('sales.grand_total'),
                t('sales.paid_amount'),
                t('sales.due_amount'),
                t('sales.payment_status'),
                t('common.actions'),
              ]}
            >
              {salesReportQuery.data?.sales?.length ? (
                salesReportQuery.data.sales.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.invoiceNumber}</strong>
                    </td>
                    <td>
                      <DateDisplay value={s.saleDate} />
                    </td>
                    <td>{s.customer ? s.customer.name : t('common.walk_in_customer')}</td>
                    <td>{s.items?.length || 0}</td>
                    <td>
                      <strong>
                        <CurrencyDisplay value={s.grandTotal} />
                      </strong>
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
                      <PaymentStatusBadge value={s.paymentStatus} />
                    </td>
                    <td>
                      <Link href={`/dashboard/sales/${s.id}`}>{t('common.view')}</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyTableState message={t('sales.no_sales_found')} />
                  </td>
                </tr>
              )}
            </DataTable>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
