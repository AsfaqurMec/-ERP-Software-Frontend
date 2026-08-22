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

export default function PurchasesReportPage() {
  const [from, setFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const purchasesReportQuery = useQuery({
    queryKey: ['purchases-report', from, to],
    queryFn: () => api<any>(`/reports/purchases?from=${from}&to=${to}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Procurement & Purchases Report"
            description="Audit supplier orders, inward logistics volume and procurement expenditures."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/dashboard/reports' },
              { label: 'Purchases' },
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

          {purchasesReportQuery.isLoading ? (
            <LoadingSpinner label="Compiling procurement records…" />
          ) : purchasesReportQuery.error ? (
            <ErrorState message={purchasesReportQuery.error.message} onRetry={() => purchasesReportQuery.refetch()} />
          ) : (
            <DataTable columns={['Purchase #', 'Date', 'Supplier', 'Items Count', 'Grand Total', 'Paid Amount', 'Due Balance', 'Payment Status', 'Actions']}>
              {purchasesReportQuery.data?.purchases?.length ? (
                purchasesReportQuery.data.purchases.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.purchaseNumber}</strong>
                    </td>
                    <td>
                      <DateDisplay value={p.purchaseDate} />
                    </td>
                    <td>{p.supplier?.name || '—'}</td>
                    <td>{p.items?.length || 0} items</td>
                    <td>
                      <strong>
                        <CurrencyDisplay value={p.grandTotal} />
                      </strong>
                    </td>
                    <td>
                      <CurrencyDisplay value={p.paidAmount} />
                    </td>
                    <td>
                      <span style={{ color: Number(p.dueAmount) > 0 ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                        <CurrencyDisplay value={p.dueAmount} />
                      </span>
                    </td>
                    <td>
                      <PaymentStatusBadge value={p.paymentStatus} />
                    </td>
                    <td>
                      <Link href={`/dashboard/purchases/${p.id}`}>View Details</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyTableState message="No purchase records found in selected interval." />
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
