'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { api } from '../../../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DateDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  ErrorState,
} from '../../../../../components/ui';

export default function PurchaseReturnDetailPage() {
  const { id } = useParams<{ id: string }>();

  const returnQuery = useQuery({
    queryKey: ['purchase-return-detail', id],
    queryFn: () => api<any>(`/purchases/returns/${id}`),
  });

  if (returnQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label="Loading purchase return details…" />
        </Shell>
      </AuthGuard>
    );
  }

  if (returnQuery.error) {
    return (
      <AuthGuard>
        <Shell>
          <ErrorState message={returnQuery.error.message} onRetry={() => returnQuery.refetch()} />
        </Shell>
      </AuthGuard>
    );
  }

  const r = returnQuery.data;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Purchase Return Receipt"
            description={`Original Order: ${r.purchase?.purchaseNumber} · Supplier: ${r.purchase?.supplier?.name}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Purchases', href: '/dashboard/purchases' },
              { label: 'Returns', href: '/dashboard/purchases/returns' },
              { label: 'Receipt' },
            ]}
          />

          <div className="detail-grid">
            <section className="card">
              <h3>Return Details</h3>
              <dl>
                <dt>Return Date</dt>
                <dd>
                  <DateDisplay value={r.date} />
                </dd>

                <dt>Reason</dt>
                <dd>{r.reason}</dd>

                <dt>Original Purchase</dt>
                <dd>
                  <Link href={`/dashboard/purchases/${r.purchase?.id}`} style={{ color: '#5068e6' }}>
                    {r.purchase?.purchaseNumber}
                  </Link>
                </dd>

                <dt>Supplier</dt>
                <dd>{r.purchase?.supplier?.name || '—'}</dd>

                <dt>Notes</dt>
                <dd style={{ gridColumn: 'span 2' }}>{r.note || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <h3>Financial Adjustments</h3>
              <dl>
                <dt>Total Debited / Credited</dt>
                <dd>
                  <strong style={{ fontSize: 16, color: '#ef4444' }}>
                    <CurrencyDisplay value={r.total} />
                  </strong>
                </dd>

                <dt>Stock Status</dt>
                <dd style={{ color: '#ef4444', fontWeight: 600 }}>Deducted from warehouse inventory</dd>

                <dt>Supplier Balance</dt>
                <dd style={{ color: '#188b64', fontWeight: 600 }}>Payable balance decremented</dd>
              </dl>
            </section>
          </div>

          <section className="card">
            <h3>Returned Items</h3>
            <DataTable columns={['Product ID', 'Quantity Returned', 'Debited Amount']}>
              {r.items?.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <code>{item.productId}</code>
                  </td>
                  <td>
                    <strong>{item.quantity} units</strong>
                  </td>
                  <td>
                    <strong>
                      <CurrencyDisplay value={item.total} />
                    </strong>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
