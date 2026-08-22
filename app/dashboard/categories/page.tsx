'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api, extractItems } from '../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DataTableToolbar,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  SearchInput,
  StatusBadge,
} from '../../../components/ui';

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  status: string;
  metrics: {
    productCount: number;
    sales: number;
    purchases: number;
    profit: number;
  };
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => api('/categories'),
  });

  const categories = extractItems<Category>(categoriesQuery.data);
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Categories"
            description="Organize catalog groupings and monitor sales, procurement volume and gross margins per category."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Categories' }]}
            action={
              <Link className="primary-button" href="/dashboard/categories/create">
                + Add Category
              </Link>
            }
          />

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search category name or description…"
            />
          </DataTableToolbar>

          {categoriesQuery.isLoading ? (
            <LoadingSpinner label="Loading categories…" />
          ) : categoriesQuery.error ? (
            <div className="error">{categoriesQuery.error.message}</div>
          ) : (
            <DataTable columns={['Category', 'Product Count', 'Total Sales', 'Purchases', 'Gross Profit', 'Status', 'Actions']}>
              {filtered.length ? (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#64748b',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <strong>{c.name}</strong>
                          {c.description && <small style={{ display: 'block', color: '#7c8497' }}>{c.description}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{c.metrics.productCount} products</span>
                    </td>
                    <td>
                      <strong>
                        <CurrencyDisplay value={c.metrics.sales} />
                      </strong>
                    </td>
                    <td>
                      <CurrencyDisplay value={c.metrics.purchases} />
                    </td>
                    <td>
                      <strong style={{ color: Number(c.metrics.profit) >= 0 ? '#188b64' : '#bd5664' }}>
                        <CurrencyDisplay value={c.metrics.profit} />
                      </strong>
                    </td>
                    <td>
                      <StatusBadge value={c.status} />
                    </td>
                    <td>
                      <Link href={`/dashboard/categories/${c.id}/edit`}>Edit</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyTableState message="No categories found matching your search." />
                  </td>
                </tr>
              )}
            </DataTable>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
