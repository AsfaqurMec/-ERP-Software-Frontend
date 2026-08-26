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

export default function PurchasesPage() {
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

  const purchasesQuery = useQuery({
    queryKey: ['purchases-list', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/purchases?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('purchases.title')}
            description={t('purchases.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('purchases.title') }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Purchase_Orders"
                  columns={[
                    { header: t('purchases.purchase_number'), key: 'purchaseNumber' },
                    { header: t('purchases.supplier'), key: 'supplier.name', formatter: (r) => r.supplier?.name || '—' },
                    { header: t('common.date'), key: 'purchaseDate' },
                    { header: t('purchases.grand_total'), key: 'grandTotal' },
                    { header: t('purchases.paid_amount'), key: 'paidAmount' },
                    { header: t('purchases.due_amount'), key: 'dueAmount' },
                    { header: t('purchases.doc_status'), key: 'status' },
                    { header: t('purchases.payment_status'), key: 'paymentStatus' },
                  ]}
                  data={purchasesQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/purchases/create">
                  {t('purchases.create_purchase')}
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
              placeholder={t('purchases.search_placeholder')}
            />

            <FilterDropdown
              label={`${t('common.all')} ${t('purchases.doc_status')}`}
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
              label={`${t('common.all')} ${t('purchases.payment_status')}`}
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

          {purchasesQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : purchasesQuery.error ? (
            <div className="error">{purchasesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('purchases.purchase_number'),
                  t('purchases.supplier'),
                  t('purchases.supplier_invoice_ref'),
                  t('common.date'),
                  t('purchases.grand_total'),
                  t('purchases.paid_amount'),
                  t('purchases.due_amount'),
                  t('purchases.payment_status'),
                  t('purchases.doc_status'),
                  t('common.actions'),
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
                        <Link href={`/dashboard/purchases/${p.id}`}>{t('common.view_details')}</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <EmptyTableState message={t('purchases.no_purchases_found')} />
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
