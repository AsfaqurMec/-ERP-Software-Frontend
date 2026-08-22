'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '../../../components/ui';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  });

  const customersQuery = useQuery({
    queryKey: ['customers-list', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/customers?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Customers"
            description="Manage client accounts, invoices, payment history and outstanding receivables."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers' }]}
            action={
              <Link className="primary-button" href="/dashboard/customers/create">
                + Add Customer
              </Link>
            }
          />

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search customer name, phone, or email…"
            />
          </DataTableToolbar>

          {customersQuery.isLoading ? (
            <LoadingSpinner label="Loading customer accounts…" />
          ) : customersQuery.error ? (
            <div className="error">{customersQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Customer Name',
                  'Phone',
                  'Email',
                  'Outstanding Due Balance',
                  'Status',
                  'Actions',
                ]}
              >
                {customersQuery.data?.data.length ? (
                  customersQuery.data.data.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.phone || '—'}</td>
                      <td>{c.email || '—'}</td>
                      <td>
                        <span style={{ color: Number(c.balance) > 0 ? '#d96a77' : 'inherit', fontWeight: 600 }}>
                          <CurrencyDisplay value={c.balance} />
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={c.status} />
                      </td>
                      <td>
                        <Link href={`/dashboard/customers/${c.id}`}>View Details</Link> ·{' '}
                        <Link href={`/dashboard/customers/${c.id}/edit`}>Edit</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyTableState message="No customers found." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={customersQuery.data?.meta.total || 0}
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
