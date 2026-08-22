'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { ExportMenu } from '../../../components/export-menu';
import { api, extractItems } from '../../../lib/api';
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
  StatusFilter,
} from '../../../components/ui';

interface Product {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  averageCost: number;
  status: string;
  category: { id: string; name: string };
  supplier?: { id: string; name: string };
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categoriesQuery = useQuery({
    queryKey: ['categories-filter'],
    queryFn: () => api('/categories'),
  });

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder,
    ...(search ? { search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(stockStatus !== 'all' ? { stockStatus } : {}),
    ...(status ? { status } : {}),
  });

  const productsQuery = useQuery({
    queryKey: ['products-list', queryParams.toString()],
    queryFn: () => api<{ data: Product[]; meta: { total: number; totalPages: number } }>(`/products?${queryParams}`),
  });

  const categories = extractItems<{ id: string; name: string }>(categoriesQuery.data);

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Products"
            description="Manage catalog, pricing, inventory thresholds and supplier associations."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Products' }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Products"
                  columns={[
                    { header: 'SKU', key: 'sku' },
                    { header: 'Product Name', key: 'name' },
                    { header: 'Category', key: 'category.name', formatter: (r) => r.category?.name || '—' },
                    { header: 'Purchase Price', key: 'purchasePrice' },
                    { header: 'Selling Price', key: 'sellingPrice' },
                    { header: 'Stock Units', key: 'stock' },
                    { header: 'Status', key: 'status' },
                  ]}
                  data={productsQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/products/create">
                  + Add Product
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
              placeholder="Search product name, SKU, barcode..."
            />

            <FilterDropdown
              label="All Categories"
              value={categoryId}
              onChange={(v) => {
                setCategoryId(v);
                setPage(1);
              }}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />

            <FilterDropdown
              label="Stock Status"
              value={stockStatus}
              onChange={(v) => {
                setStockStatus(v);
                setPage(1);
              }}
              options={[
                { label: 'All Stock Levels', value: 'all' },
                { label: 'In Stock (> 0)', value: 'in_stock' },
                { label: 'Low Stock Threshold', value: 'low_stock' },
                { label: 'Out of Stock (0)', value: 'out_of_stock' },
                { label: 'Overstocked', value: 'overstocked' },
              ]}
            />

            <StatusFilter
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            />

            <select
              aria-label="Sort by"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
                setPage(1);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="sellingPrice-desc">Selling Price (High-Low)</option>
              <option value="sellingPrice-asc">Selling Price (Low-High)</option>
              <option value="stock-desc">Stock (High-Low)</option>
              <option value="stock-asc">Stock (Low-High)</option>
            </select>
          </DataTableToolbar>

          {productsQuery.isLoading ? (
            <LoadingSpinner label="Loading products…" />
          ) : productsQuery.error ? (
            <div className="error">{productsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Product',
                  'SKU',
                  'Category',
                  'Purchase Price',
                  'Selling Price',
                  'Stock',
                  'Stock Value',
                  'Status',
                  'Actions',
                ]}
              >
                {productsQuery.data?.data.length ? (
                  productsQuery.data.data.map((p) => {
                    const stockVal = Number(p.stock) * Number(p.averageCost || p.purchasePrice);
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
                          <CurrencyDisplay value={p.purchasePrice} />
                        </td>
                        <td>
                          <strong>
                            <CurrencyDisplay value={p.sellingPrice} />
                          </strong>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: Number(p.stock) <= 0 ? '#ef4444' : 'inherit',
                            }}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <CurrencyDisplay value={stockVal} />
                        </td>
                        <td>
                          <StatusBadge value={p.status} />
                        </td>
                        <td>
                          <Link href={`/dashboard/products/${p.id}`}>View</Link> ·{' '}
                          <Link href={`/dashboard/products/${p.id}/edit`}>Edit</Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <EmptyTableState message="No products found matching the selected filters." />
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
