'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  EmptyTableState,
  FilterDropdown,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '../../../../components/ui';

export default function StockTrackingPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('all');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(stockStatus !== 'all' ? { stockStatus } : {}),
  });

  const productsQuery = useQuery({
    queryKey: ['stock-tracking', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/products?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Stock Position"
            description="Live product inventory quantities, average cost and stock values."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Inventory', href: '/dashboard/inventory' },
              { label: 'Stock Position' },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/inventory/adjustments">
                + Adjust Stock
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
              placeholder="Search product or SKU…"
            />
            <FilterDropdown
              label="All Stock Levels"
              value={stockStatus}
              onChange={(v) => {
                setStockStatus(v);
                setPage(1);
              }}
              options={[
                { label: 'All Items', value: 'all' },
                { label: 'In Stock (> 0)', value: 'in_stock' },
                { label: 'Low Stock Threshold', value: 'low_stock' },
                { label: 'Out of Stock (0)', value: 'out_of_stock' },
                { label: 'Overstocked', value: 'overstocked' },
              ]}
            />
          </DataTableToolbar>

          {productsQuery.isLoading ? (
            <LoadingSpinner label="Loading stock levels…" />
          ) : productsQuery.error ? (
            <div className="error">{productsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Product',
                  'SKU',
                  'Category',
                  'Current Stock',
                  'Avg Purchase Cost',
                  'Total Stock Value',
                  'Min / Max Threshold',
                  'Status',
                  'Actions',
                ]}
              >
                {productsQuery.data?.data.length ? (
                  productsQuery.data.data.map((p) => {
                    const isLow = Number(p.stock) > 0 && Number(p.stock) <= Number(p.minimumStock);
                    const isOut = Number(p.stock) <= 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>
                          <code>{p.sku}</code>
                        </td>
                        <td>{p.category?.name || '—'}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isOut ? '#ef4444' : isLow ? '#d28d2b' : '#188b64',
                            }}
                          >
                            {p.stock} {p.unit}
                          </span>
                        </td>
                        <td>
                          <CurrencyDisplay value={p.averageCost} />
                        </td>
                        <td>
                          <strong>
                            <CurrencyDisplay value={Number(p.stock) * Number(p.averageCost)} />
                          </strong>
                        </td>
                        <td>
                          {p.minimumStock} min / {p.maximumStock || '∞'} max
                        </td>
                        <td>
                          <StatusBadge value={isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : p.status} />
                        </td>
                        <td>
                          <Link href={`/dashboard/products/${p.id}`}>Details</Link> ·{' '}
                          <Link href={`/dashboard/inventory/adjustments?productId=${p.id}`}>Adjust</Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <EmptyTableState message="No stock items match your criteria." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={productsQuery.data?.meta.total || 0}
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
