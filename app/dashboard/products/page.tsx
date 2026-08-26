'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { ExportMenu } from '../../../components/export-menu';
import { api, extractItems } from '../../../lib/api';
import { useTranslation } from '../../../provider';
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
  const { t } = useTranslation();
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
            title={t('products.title')}
            description={t('products.description')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('products.title') }]}
            action={
              <div style={{ display: 'flex', gap: 8 }}>
                <ExportMenu
                  filename="StockPilot_Products"
                  columns={[
                    { header: t('products.sku'), key: 'sku' },
                    { header: t('products.name'), key: 'name' },
                    { header: t('products.category'), key: 'category.name', formatter: (r) => r.category?.name || '—' },
                    { header: t('products.purchase_price'), key: 'purchasePrice' },
                    { header: t('products.selling_price'), key: 'sellingPrice' },
                    { header: t('products.stock_units'), key: 'stock' },
                    { header: t('common.status'), key: 'status' },
                  ]}
                  data={productsQuery.data?.data || []}
                />
                <Link className="primary-button" href="/dashboard/products/create">
                  {t('products.add_product')}
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
              placeholder={t('products.search_placeholder')}
            />

            <FilterDropdown
              label={t('products.all_categories')}
              value={categoryId}
              onChange={(v) => {
                setCategoryId(v);
                setPage(1);
              }}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />

            <FilterDropdown
              label={t('products.all_stock_levels')}
              value={stockStatus}
              onChange={(v) => {
                setStockStatus(v);
                setPage(1);
              }}
              options={[
                { label: t('products.all_stock_levels'), value: 'all' },
                { label: t('products.in_stock_filter'), value: 'in_stock' },
                { label: t('products.low_stock_filter'), value: 'low_stock' },
                { label: t('products.out_of_stock_filter'), value: 'out_of_stock' },
                { label: t('products.overstocked_filter'), value: 'overstocked' },
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
              aria-label={t('common.filter')}
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
                setPage(1);
              }}
            >
              <option value="createdAt-desc">{t('common.newest_first')}</option>
              <option value="name-asc">{t('common.name_az')}</option>
              <option value="sellingPrice-desc">{t('common.price_high_low')}</option>
              <option value="sellingPrice-asc">{t('common.price_low_high')}</option>
              <option value="stock-desc">{t('common.stock_high_low')}</option>
              <option value="stock-asc">{t('common.stock_low_high')}</option>
            </select>
          </DataTableToolbar>

          {productsQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : productsQuery.error ? (
            <div className="error">{productsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('products.name'),
                  t('products.sku'),
                  t('products.category'),
                  t('products.purchase_price'),
                  t('products.selling_price'),
                  t('products.stock_units'),
                  t('products.stock_value'),
                  t('common.status'),
                  t('common.actions'),
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
                          <Link href={`/dashboard/products/${p.id}`}>{t('common.view')}</Link> ·{' '}
                          <Link href={`/dashboard/products/${p.id}/edit`}>{t('common.edit')}</Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <EmptyTableState message={t('products.no_products_found')} />
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
