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
} from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function SupplierDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => api<any>(`/suppliers/${id}`),
  });

  if (q.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label={t('common.loading')} />
        </Shell>
      </AuthGuard>
    );
  }

  if (q.error) {
    return (
      <AuthGuard>
        <Shell>
          <div className="error">{q.error.message}</div>
        </Shell>
      </AuthGuard>
    );
  }

  const s = q.data;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={s.name}
            description={s.company || t('suppliers.supplier_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('suppliers.title'), href: '/dashboard/suppliers' },
              { label: s.name },
            ]}
            action={
              <Link className="primary-button" href={`/dashboard/suppliers/${id}/edit`}>
                {t('suppliers.edit_supplier')}
              </Link>
            }
          />
          <StatCardGrid>
            <StatCard label={t('reports.procurement_cost')} value={<CurrencyDisplay value={s.summary.totalPurchases} />} />
            <StatCard label={t('payments.total_paid')} value={<CurrencyDisplay value={s.summary.totalPaid} />} />
            <StatCard label={t('dues.payable')} value={<CurrencyDisplay value={s.summary.totalDue} />} />
            <StatCard label={t('common.status')} value={<StatusBadge value={s.status} />} />
          </StatCardGrid>
          <section className="card">
            <h3>{t('purchases.title')}</h3>
            <DataTable
              columns={[
                t('purchases.purchase_number'),
                t('common.date'),
                t('common.total'),
                t('purchases.paid_amount'),
                t('purchases.due_amount'),
                t('common.status'),
              ]}
            >
              {s.purchases.map((p: any) => (
                <tr key={p.id}>
                  <td>{p.purchaseNumber}</td>
                  <td>
                    <DateDisplay value={p.purchaseDate} />
                  </td>
                  <td>
                    <CurrencyDisplay value={p.grandTotal} />
                  </td>
                  <td>
                    <CurrencyDisplay value={p.paidAmount} />
                  </td>
                  <td>
                    <CurrencyDisplay value={p.dueAmount} />
                  </td>
                  <td>
                    <StatusBadge value={p.status} />
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
          <section className="card">
            <h3>{t('payments.title')}</h3>
            <DataTable
              columns={[
                t('common.date'),
                t('common.amount'),
                t('common.payment_method'),
                t('activity_logs.reference'),
                t('common.description'),
              ]}
            >
              {s.payments.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <DateDisplay value={p.date} />
                  </td>
                  <td>
                    <CurrencyDisplay value={p.amount} />
                  </td>
                  <td>{p.method}</td>
                  <td>{p.reference || '—'}</td>
                  <td>{p.note || '—'}</td>
                </tr>
              ))}
            </DataTable>
          </section>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
