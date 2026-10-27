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
                  'Credit Risk',
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
                      <td>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              c.riskLevel === 'HIGH'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : c.riskLevel === 'MEDIUM'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              c.riskLevel === 'HIGH'
                                ? '#ef4444'
                                : c.riskLevel === 'MEDIUM'
                                ? '#f59e0b'
                                : '#10b981',
                            border: `1px solid ${
                              c.riskLevel === 'HIGH'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : c.riskLevel === 'MEDIUM'
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(16, 185, 129, 0.3)'
                            }`,
                          }}
                        >
                          {c.riskLevel === 'HIGH' ? '🔴 High Risk (COD)' : c.riskLevel === 'MEDIUM' ? '🟡 Medium' : '🟢 Low Risk'}
                        </span>
                      </td>
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
                        {Number(c.balance) > 0 && c.phone && (
                          <>
                            {' '}·{' '}
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '').startsWith('880') ? c.phone.replace(/[^0-9]/g, '') : `88${c.phone.replace(/[^0-9]/g, '')}`}?text=${encodeURIComponent(
                                `Dear ${c.name}, friendly reminder regarding your outstanding balance of ৳${Number(c.balance).toLocaleString()} with StockPilot. Thank you!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}
                              title="Send WhatsApp payment reminder"
                            >
                              💬 WhatsApp
                            </a>
                          </>
                        )}
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
