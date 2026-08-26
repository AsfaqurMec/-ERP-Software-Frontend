'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
import { useTranslation } from '../../../provider';
import {
  CurrencyDisplay,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DateDisplay,
  EmptyTableState,
  FilterDropdown,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '../../../components/ui';

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [partyType, setPartyType] = useState('');
  const [method, setMethod] = useState('');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(partyType ? { partyType } : {}),
    ...(method ? { method } : {}),
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments-list', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/payments?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('payments.title')}
            description={t('payments.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('payments.title') }]}
          />

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder={t('payments.search_placeholder')}
            />

            <FilterDropdown
              label={t('payments.all_party_types')}
              value={partyType}
              onChange={(v) => {
                setPartyType(v);
                setPage(1);
              }}
              options={[
                { label: t('payments.customer_collections'), value: 'CUSTOMER' },
                { label: t('payments.supplier_disbursements'), value: 'SUPPLIER' },
              ]}
            />

            <FilterDropdown
              label={t('payments.all_payment_methods')}
              value={method}
              onChange={(v) => {
                setMethod(v);
                setPage(1);
              }}
              options={['CASH', 'BANK', 'BKASH', 'NAGAD', 'CARD', 'OTHER'].map((m) => ({
                label: m,
                value: m,
              }))}
            />
          </DataTableToolbar>

          {paymentsQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : paymentsQuery.error ? (
            <div className="error">{paymentsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('common.date'),
                  t('payments.party_type'),
                  t('payments.party_name'),
                  t('payments.amount'),
                  t('payments.payment_method'),
                  t('payments.reference'),
                  t('common.notes'),
                ]}
              >
                {paymentsQuery.data?.data.length ? (
                  paymentsQuery.data.data.map((p: any) => {
                    const partyName = p.partyType === 'CUSTOMER' ? p.customer?.name : p.supplier?.name;
                    return (
                      <tr key={p.id}>
                        <td>
                          <DateDisplay value={p.date} />
                        </td>
                        <td>
                          <StatusBadge value={p.partyType} />
                        </td>
                        <td>
                          <strong>{partyName || '—'}</strong>
                        </td>
                        <td>
                          <strong style={{ color: p.partyType === 'CUSTOMER' ? '#188b64' : '#bd5664' }}>
                            <CurrencyDisplay value={p.amount} />
                          </strong>
                        </td>
                        <td>
                          <StatusBadge value={p.method} />
                        </td>
                        <td>
                          {p.reference ? (
                            <code>{p.reference}</code>
                          ) : p.sale ? (
                            <code>{p.sale.invoiceNumber}</code>
                          ) : p.purchase ? (
                            <code>{p.purchase.purchaseNumber}</code>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{p.note || '—'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyTableState message={t('payments.no_payments_found')} />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={paymentsQuery.data?.meta.total || 0}
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
