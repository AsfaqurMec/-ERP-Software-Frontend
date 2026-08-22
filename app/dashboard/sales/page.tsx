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

export default function SalesPage() {
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

  const salesQuery = useQuery({
    queryKey: ['sales-list', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number; totalPages: number } }>(`/sales?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Sales Invoices"
            description="Manage customer invoices, order fulfillments, payment receipts and accounts receivable."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Sales' }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Sales_Invoices"
                  columns={[
                    { header: 'Invoice Number', key: 'invoiceNumber' },
                    { header: 'Customer', key: 'customer.name', formatter: (r) => r.customer?.name || 'Walk-in Client' },
                    { header: 'Date', key: 'saleDate' },
                    { header: 'Grand Total', key: 'grandTotal' },
                    { header: 'Paid Amount', key: 'paidAmount' },
                    { header: 'Due Balance', key: 'dueAmount' },
                    { header: 'Doc Status', key: 'status' },
                    { header: 'Payment Status', key: 'paymentStatus' },
                  ]}
                  data={salesQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/sales/create">
                  + Create Sale
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
              placeholder="Search invoice #, customer name…"
            />

            <FilterDropdown
              label="All Document Statuses"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { label: 'Confirmed (Stock Reduced)', value: 'CONFIRMED' },
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

          {salesQuery.isLoading ? (
            <LoadingSpinner label="Loading sales invoices…" />
          ) : salesQuery.error ? (
            <div className="error">{salesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Invoice #',
                  'Customer',
                  'Date',
                  'Grand Total',
                  'Paid Amount',
                  'Due Amount',
                  'Payment',
                  'Status',
                  'Actions',
                ]}
              >
                {salesQuery.data?.data.length ? (
                  salesQuery.data.data.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.invoiceNumber}</strong>
                      </td>
                      <td>{s.customer ? s.customer.name : <span style={{ color: '#8c93a8' }}>Walk-in Customer</span>}</td>
                      <td>
                        <DateDisplay value={s.saleDate} />
                      </td>
                      <td>
                        <strong>
                          <CurrencyDisplay value={s.grandTotal} />
                        </strong>
                      </td>
                      <td>
                        <CurrencyDisplay value={s.paidAmount} />
                      </td>
                      <td>
                        <span style={{ color: Number(s.dueAmount) > 0 ? '#d96a77' : 'inherit', fontWeight: 600 }}>
                          <CurrencyDisplay value={s.dueAmount} />
                        </span>
                      </td>
                      <td>
                        <PaymentStatusBadge value={s.paymentStatus} />
                      </td>
                      <td>
                        <StatusBadge value={s.status} />
                      </td>
                      <td>
                        <Link href={`/dashboard/sales/${s.id}`}>View Details</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <EmptyTableState message="No sales invoices found matching your criteria." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={salesQuery.data?.meta.total || 0}
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
