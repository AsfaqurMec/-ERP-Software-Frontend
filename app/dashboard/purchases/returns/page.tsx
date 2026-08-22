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
  DataTableToolbar,
  DateDisplay,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
} from '../../../../components/ui';

export default function PurchaseReturnsPage() {
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
            title="Purchase Returns"
            description="Manage goods returned to suppliers, deducting stock counts and reducing accounts payable."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Purchases', href: '/dashboard/purchases' },
              { label: 'Returns' },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/purchases/returns/create">
                + New Purchase Return
              </Link>
            }
          />

          {returnsQuery.isLoading ? (
            <LoadingSpinner label="Loading purchase returns records…" />
          ) : returnsQuery.error ? (
            <div className="error">{returnsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Return Date',
                  'Purchase #',
                  'Supplier',
                  'Return Amount',
                  'Reason',
                  'Items Returned',
                  'Actions',
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
                      <td>{r.items?.length || 0} line items</td>
                      <td>
                        <Link href={`/dashboard/purchases/returns/${r.id}`}>View Receipt</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyTableState message="No purchase returns recorded." />
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
