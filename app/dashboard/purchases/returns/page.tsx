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
  DataTablePagination,
  DateDisplay,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
} from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function PurchaseReturnsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const returnsQuery = useQuery({
    queryKey: ['purchase-returns-list', page, limit],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/purchases/returns?page=${page}&limit=${limit}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('purchases.returns_title')}
            description={t('purchases.returns_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('purchases.title'), href: '/dashboard/purchases' },
              { label: t('purchases.returns_title') },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/purchases/returns/create">
                + {t('purchases.record_return')}
              </Link>
            }
          />

          {returnsQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : returnsQuery.error ? (
            <div className="error">{returnsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('common.date'),
                  t('purchases.purchase_number'),
                  t('purchases.supplier'),
                  t('common.total'),
                  t('inventory.reason'),
                  t('products.units'),
                  t('common.actions'),
                ]}
              >
                {returnsQuery.data?.data.length ? (
                  returnsQuery.data.data.map((r: any) => (
                    <tr key={r.id}>
                      <td>
                        <DateDisplay value={r.date} />
                      </td>
                      <td>
                        <strong>{r.purchase?.purchaseNumber || '—'}</strong>
                      </td>
                      <td>{r.purchase?.supplier?.name || '—'}</td>
                      <td>
                        <strong style={{ color: '#ef4444' }}>
                          <CurrencyDisplay value={r.total} />
                        </strong>
                      </td>
                      <td>{r.reason}</td>
                      <td>{r.items?.length || 0}</td>
                      <td>
                        <Link href={`/dashboard/purchases/returns/${r.id}`}>{t('common.view')}</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyTableState message={t('purchases.no_purchases_found')} />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={returnsQuery.data?.meta.total || 0}
                limit={limit}
                onPage={setPage}
                onLimitChange={setLimit}
              />
            </>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
