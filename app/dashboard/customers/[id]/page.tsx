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

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const customerQuery = useQuery({
    queryKey: ['customer-detail', id],
    queryFn: () => api<any>(`/customers/${id}`),
  });

  if (customerQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label="Loading customer ledger and transaction history…" />
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
            description={`Customer profile & ledger · Phone: ${c.phone || '—'}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Customers', href: '/dashboard/customers' },
              { label: c.name },
            ]}
            action={
              <Link className="primary-button" href={`/dashboard/customers/${id}/edit`}>
                Edit Customer
              </Link>
            }
          />

          <StatCardGrid columns={5}>
            <StatCard
              label="Total Sales Volume"
              value={<CurrencyDisplay value={c.summary.totalSales} />}
              detail={`${c.summary.salesCount} lifetime orders`}
              kind="blue"
            />
            <StatCard
              label="Total Payments Received"
              value={<CurrencyDisplay value={c.summary.totalPaid} />}
              detail={`${c.summary.paymentCount} payments recorded`}
              kind="green"
            />
            <StatCard
              label="Outstanding Due Balance"
              value={<CurrencyDisplay value={c.summary.totalDue} />}
              detail="Receivable amount"
              kind="rose"
            />
            <StatCard
              label="Total Returns Credited"
              value={<CurrencyDisplay value={c.summary.totalReturns || 0} />}
              detail="Restocked returns"
              kind="amber"
            />
            <StatCard label="Account Status" value={<StatusBadge value={c.status} />} kind="neutral" />
          </StatCardGrid>

          <div className="detail-grid">
            <section className="card">
              <h3>Customer Contact & Details</h3>
              <dl>
                <dt>Customer Name</dt>
                <dd>
                  <strong>{c.name}</strong>
                </dd>

                <dt>Phone Number</dt>
                <dd>{c.phone || '—'}</dd>

                <dt>Email Address</dt>
                <dd>{c.email || '—'}</dd>

                <dt>Opening Balance</dt>
                <dd>
                  <CurrencyDisplay value={c.openingBalance} />
                </dd>

                <dt>Address</dt>
                <dd style={{ gridColumn: 'span 2' }}>{c.address || '—'}</dd>

                <dt>Notes</dt>
                <dd style={{ gridColumn: 'span 2' }}>{c.notes || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <h3>Payment History</h3>
              <DataTable columns={['Date', 'Amount', 'Method', 'Reference']}>
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
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </DataTable>
            </section>
          </div>

          <section className="card">
            <div className="card-head">
              <div>
                <h3>Sales Invoices History</h3>
                <p>All invoices billed to this customer</p>
              </div>
            </div>
            <DataTable columns={['Invoice #', 'Date', 'Total', 'Paid', 'Due', 'Status', 'Actions']}>
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
                      <Link href={`/dashboard/sales/${s.id}`}>View Invoice</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty">
                    No sales orders created for this customer yet.
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
