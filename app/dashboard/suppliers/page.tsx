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
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '../../../components/ui';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
  });

  const query = useQuery({
    queryKey: ['suppliers-list', queryParams.toString()],
    queryFn: () => api<any>(`/suppliers?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Suppliers"
            description="Manage supplier profiles, procurement history, and payables."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Suppliers' }]}
            action={
              <Link className="primary-button" href="/dashboard/suppliers/create">
                + Add Supplier
              </Link>
            }
          />

          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search supplier, company, or phone…"
          />

          {query.isLoading ? (
            <LoadingSpinner label="Loading suppliers directory…" />
          ) : query.error ? (
            <div className="form-error">{query.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Supplier Name',
                  'Company',
                  'Phone',
                  'Email',
                  'Outstanding Due',
                  'Status',
                  'Actions',
                ]}
              >
                {query.data?.data?.length ? (
                  query.data.data.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>{s.company || '—'}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{s.email || '—'}</td>
                      <td>
                        <strong style={{ color: Number(s.balance) > 0 ? '#dc2626' : '#16a34a' }}>
                          <CurrencyDisplay value={s.balance} />
                        </strong>
                      </td>
                      <td>
                        <StatusBadge value={s.status} />
                      </td>
                      <td>
                        <Link href={`/dashboard/suppliers/${s.id}`}>View Details</Link> ·{' '}
                        <Link href={`/dashboard/suppliers/${s.id}/edit`}>Edit</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyTableState message="No suppliers found." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={query.data?.meta?.total || 0}
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
