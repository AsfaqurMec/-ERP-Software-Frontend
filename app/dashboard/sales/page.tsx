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
  const { t } = useTranslation();
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
            title={t('sales.title')}
            description={t('sales.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('sales.title') }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Sales_Invoices"
                  columns={[
                    { header: t('sales.invoice_number'), key: 'invoiceNumber' },
                    { header: t('sales.customer'), key: 'customer.name', formatter: (r) => r.customer?.name || t('common.walk_in_customer') },
                    { header: t('common.date'), key: 'saleDate' },
                    { header: t('sales.grand_total'), key: 'grandTotal' },
                    { header: t('sales.paid_amount'), key: 'paidAmount' },
                    { header: t('sales.due_amount'), key: 'dueAmount' },
                    { header: t('sales.doc_status'), key: 'status' },
                    { header: t('sales.payment_status'), key: 'paymentStatus' },
                  ]}
                  data={salesQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/sales/create">
                  {t('sales.create_sale')}
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
              placeholder={t('sales.search_placeholder')}
            />

            <FilterDropdown
              label={`${t('common.all')} ${t('sales.doc_status')}`}
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { label: t('status.confirmed'), value: 'CONFIRMED' },
                { label: t('status.draft'), value: 'DRAFT' },
                { label: t('status.cancelled'), value: 'CANCELLED' },
              ]}
            />

            <FilterDropdown
              label={`${t('common.all')} ${t('sales.payment_status')}`}
              value={paymentStatus}
              onChange={(v) => {
                setPaymentStatus(v);
                setPage(1);
              }}
              options={[
                { label: t('status.paid'), value: 'PAID' },
                { label: t('status.partial'), value: 'PARTIAL' },
                { label: t('status.unpaid'), value: 'UNPAID' },
              ]}
            />
          </DataTableToolbar>

          {salesQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : salesQuery.error ? (
            <div className="error">{salesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('sales.invoice_number'),
                  t('sales.customer'),
                  t('common.date'),
                  t('sales.grand_total'),
                  t('sales.paid_amount'),
                  t('sales.due_amount'),
                  t('sales.payment_status'),
                  t('sales.doc_status'),
                  t('common.actions'),
                ]}
              >
                {salesQuery.data?.data.length ? (
                  salesQuery.data.data.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.invoiceNumber}</strong>
                      </td>
                      <td>{s.customer ? s.customer.name : <span style={{ color: '#8c93a8' }}>{t('common.walk_in_customer')}</span>}</td>
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
                        <Link href={`/dashboard/sales/${s.id}`}>{t('common.view_details')}</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <EmptyTableState message={t('sales.no_sales_found')} />
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
