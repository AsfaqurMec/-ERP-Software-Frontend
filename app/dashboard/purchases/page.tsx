'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { ExportMenu } from '../../../components/export-menu';
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
  PaymentStatusBadge,
  SearchInput,
  StatusBadge,
} from '../../../components/ui';

export default function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
  });

  const purchasesQuery = useQuery({
    queryKey: ['purchases-list', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/purchases?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Purchases"
            description="Manage supplier purchase orders, procurement bills, stock receipts and payment statuses."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Purchases' }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Purchase_Orders"
                  columns={[
                    { header: 'PO Number', key: 'purchaseNumber' },
                    { header: 'Supplier', key: 'supplier.name', formatter: (r) => r.supplier?.name || '—' },
                    { header: 'Date', key: 'purchaseDate' },
                    { header: 'Grand Total', key: 'grandTotal' },
                    { header: 'Paid Amount', key: 'paidAmount' },
                    { header: 'Due Amount', key: 'dueAmount' },
                    { header: 'Doc Status', key: 'status' },
                    { header: 'Payment Status', key: 'paymentStatus' },
                  ]}
                  data={purchasesQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/purchases/create">
                  + Create Purchase
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
              placeholder="Search purchase #, supplier, or invoice…"
            />

            <FilterDropdown
              label="All Document Statuses"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { label: 'Confirmed (Stock Updated)', value: 'CONFIRMED' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ]}
            />

            <FilterDropdown
              label="All Payment Statuses"
              value={paymentStatus}
              onChange={(v) => {
                setPaymentStatus(v);
                setPage(1);
              }}
              options={[
                { label: 'Paid', value: 'PAID' },
                { label: 'Partial Due', value: 'PARTIAL' },
                { label: 'Unpaid', value: 'UNPAID' },
              ]}
            />
          </DataTableToolbar>

          {purchasesQuery.isLoading ? (
            <LoadingSpinner label="Loading purchase orders…" />
          ) : purchasesQuery.error ? (
            <div className="error">{purchasesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Purchase #',
                  'Supplier',
                  'Invoice Ref',
                  'Date',
                  'Grand Total',
                  'Paid Amount',
                  'Due Amount',
                  'Payment',
                  'Status',
                  'Actions',
                ]}
              >
                {purchasesQuery.data?.data.length ? (
                  purchasesQuery.data.data.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.purchaseNumber}</strong>
                      </td>
                      <td>{p.supplier?.name || '—'}</td>
                      <td>{p.invoiceNumber || '—'}</td>
                      <td>
                        <DateDisplay value={p.purchaseDate} />
                      </td>
                      <td>
                        <strong>
                          <CurrencyDisplay value={p.grandTotal} />
                        </strong>
                      </td>
                      <td>
                        <CurrencyDisplay value={p.paidAmount} />
                      </td>
                      <td>
                        <span style={{ color: Number(p.dueAmount) > 0 ? '#d96a77' : 'inherit', fontWeight: 600 }}>
                          <CurrencyDisplay value={p.dueAmount} />
                        </span>
                      </td>
                      <td>
                        <PaymentStatusBadge value={p.paymentStatus} />
                      </td>
                      <td>
                        <StatusBadge value={p.status} />
                      </td>
                      <td>
                        <Link href={`/dashboard/purchases/${p.id}`}>View Details</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <EmptyTableState message="No purchases found matching your criteria." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={purchasesQuery.data?.meta.total || 0}
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
