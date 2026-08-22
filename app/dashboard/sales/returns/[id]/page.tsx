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

export default function SalesReturnDetailPage() {
  const { id } = useParams<{ id: string }>();

  const returnQuery = useQuery({
    queryKey: ['sales-return-detail', id],
    queryFn: () => api<any>(`/sales/returns/${id}`),
  });

  if (returnQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label="Loading sales return details…" />
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
            title="Sales Return Receipt"
            description={`Original Sale: ${r.sale?.invoiceNumber} · Customer: ${r.sale?.customer?.name || 'Walk-in'}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Sales', href: '/dashboard/sales' },
              { label: 'Returns', href: '/dashboard/sales/returns' },
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

                <dt>Original Invoice</dt>
                <dd>
                  <Link href={`/dashboard/sales/${r.sale?.id}`} style={{ color: '#5068e6' }}>
                    {r.sale?.invoiceNumber}
                  </Link>
                </dd>

                <dt>Customer</dt>
                <dd>{r.sale?.customer?.name || 'Walk-in Customer'}</dd>

                <dt>Notes</dt>
                <dd style={{ gridColumn: 'span 2' }}>{r.note || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <h3>Financial Adjustments</h3>
              <dl>
                <dt>Total Credited / Returned</dt>
                <dd>
                  <strong style={{ fontSize: 16, color: '#ef4444' }}>
                    <CurrencyDisplay value={r.total} />
                  </strong>
                </dd>

                <dt>COGS Adjustment</dt>
                <dd>
                  <CurrencyDisplay value={r.cogs} />
                </dd>

                <dt>Stock Status</dt>
                <dd style={{ color: '#188b64', fontWeight: 600 }}>Restocked into inventory</dd>
              </dl>
            </section>
          </div>

          <section className="card">
            <h3>Returned Items</h3>
            <DataTable columns={['Item ID', 'Quantity Returned', 'Credited Amount']}>
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
