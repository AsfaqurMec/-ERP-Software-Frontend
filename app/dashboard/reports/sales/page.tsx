'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
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
            title="Sales & Revenue Report"
            description="Audit confirmed customer sales orders, product demand and revenue totals for any date range."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/dashboard/reports' },
              { label: 'Sales' },
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

          {salesReportQuery.isLoading ? (
            <LoadingSpinner label="Compiling sales ledger report…" />
          ) : salesReportQuery.error ? (
            <ErrorState message={salesReportQuery.error.message} onRetry={() => salesReportQuery.refetch()} />
          ) : (
            <DataTable columns={['Invoice #', 'Date', 'Customer', 'Items Count', 'Grand Total', 'Paid Amount', 'Due Balance', 'Payment Status', 'Actions']}>
              {salesReportQuery.data?.sales?.length ? (
                salesReportQuery.data.sales.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.invoiceNumber}</strong>
                    </td>
                    <td>
                      <DateDisplay value={s.saleDate} />
                    </td>
                    <td>{s.customer ? s.customer.name : 'Walk-in Customer'}</td>
                    <td>{s.items?.length || 0} items</td>
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
                      <Link href={`/dashboard/invoices/${s.id}`}>View Invoice</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyTableState message="No sales records found in selected date interval." />
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
