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

export default function SalesReturnsPage() {
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
            title="Sales Returns"
            description="Audit and record returned goods from customers, restocking inventory and crediting customer balances."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Sales', href: '/dashboard/sales' },
              { label: 'Returns' },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/sales/returns/create">
                + New Sales Return
              </Link>
            }
          />

          {returnsQuery.isLoading ? (
            <LoadingSpinner label="Loading sales returns records…" />
          ) : returnsQuery.error ? (
            <div className="error">{returnsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Return Date',
                  'Invoice #',
                  'Customer',
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
                        <strong>{r.sale?.invoiceNumber || '—'}</strong>
                      </td>
                      <td>{r.sale?.customer?.name || 'Walk-in Customer'}</td>
                      <td>
                        <strong style={{ color: '#ef4444' }}>
                          <CurrencyDisplay value={r.total} />
                        </strong>
                      </td>
                      <td>{r.reason}</td>
                      <td>{r.items?.length || 0} line items</td>
                      <td>
                        <Link href={`/dashboard/sales/returns/${r.id}`}>View Receipt</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyTableState message="No sales returns recorded." />
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
