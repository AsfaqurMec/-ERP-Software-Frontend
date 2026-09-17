'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { ExportMenu } from '../../../components/export-menu';
import { api } from '../../../lib/api';
import { useTranslation } from '../../../provider';
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
  const { t } = useTranslation();
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
            title={t('customers.title')}
            description={t('customers.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('customers.title') }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Customers"
                  columns={[
                    { header: t('customers.customer_name'), key: 'name' },
                    { header: t('common.phone'), key: 'phone' },
                    { header: t('common.email'), key: 'email' },
                    { header: t('customers.outstanding_due'), key: 'balance', formatter: (r) => r.balance ?? 0 },
                    { header: t('common.status'), key: 'status' },
                  ]}
                  data={customersQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/customers/create">
                  {t('customers.add_customer')}
                </Link>
              </div>
            }
          />

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder={t('customers.search_placeholder')}
            />
          </DataTableToolbar>

          {customersQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : customersQuery.error ? (
            <div className="error">{customersQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('customers.customer_name'),
                  t('common.phone'),
                  t('common.email'),
                  t('customers.outstanding_due'),
                  t('common.status'),
                  t('common.actions'),
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
                        <Link href={`/dashboard/customers/${c.id}`}>{t('common.view_details')}</Link> ·{' '}
                        <Link href={`/dashboard/customers/${c.id}/edit`}>{t('common.edit')}</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyTableState message={t('customers.no_customers_found')} />
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
