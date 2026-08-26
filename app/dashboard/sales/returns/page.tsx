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

export default function SalesReturnsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const returnsQuery = useQuery({
    queryKey: ['sales-returns-list', page, limit],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/sales/returns?page=${page}&limit=${limit}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('sales.returns_title')}
            description={t('sales.returns_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('sales.title'), href: '/dashboard/sales' },
              { label: t('sales.returns_title') },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/sales/returns/create">
                + {t('sales.record_return')}
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
                  t('sales.invoice_number'),
                  t('sales.customer'),
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
                        <strong>{r.sale?.invoiceNumber || '—'}</strong>
                      </td>
                      <td>{r.sale?.customer?.name || t('common.walk_in_customer')}</td>
                      <td>
                        <strong style={{ color: '#ef4444' }}>
                          <CurrencyDisplay value={r.total} />
                        </strong>
                      </td>
                      <td>{r.reason}</td>
                      <td>{r.items?.length || 0}</td>
                      <td>
                        <Link href={`/dashboard/sales/returns/${r.id}`}>{t('common.view')}</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyTableState message={t('sales.no_sales_found')} />
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
