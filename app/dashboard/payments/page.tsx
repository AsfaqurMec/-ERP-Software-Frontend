'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
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
            title="Payments Ledger"
            description="Audit all customer collections and supplier disbursement receipts."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance & Accounts', href: '/dashboard/payments' }, { label: 'Payments Ledger' }]}
          />

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search reference, customer or supplier…"
            />

            <FilterDropdown
              label="All Party Types"
              value={partyType}
              onChange={(v) => {
                setPartyType(v);
                setPage(1);
              }}
              options={[
                { label: 'Customer Collections', value: 'CUSTOMER' },
                { label: 'Supplier Disbursements', value: 'SUPPLIER' },
              ]}
            />

            <FilterDropdown
              label="All Payment Methods"
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
            <LoadingSpinner label="Loading payments ledger…" />
          ) : paymentsQuery.error ? (
            <div className="error">{paymentsQuery.error.message}</div>
          ) : (
            <>
              <DataTable columns={['Date', 'Party Type', 'Party Name', 'Amount', 'Method', 'Reference / Link', 'Notes']}>
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
                      <EmptyTableState message="No payment records found." />
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
