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
  DateDisplay,
  EmptyTableState,
  FilterDropdown,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatusBadge,
} from '../../../../components/ui';

export default function StockMovementsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [movementType, setMovementType] = useState('');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(movementType ? { type: movementType } : {}),
  });

  const movementsQuery = useQuery({
    queryKey: ['stock-movements', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/inventory/movements?${queryParams}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Stock Movements"
            description="Immutable audit trail of all inventory receipts, sales dispatches, returns and manual adjustments."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Inventory', href: '/dashboard/inventory' },
              { label: 'Movements' },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/inventory/adjustments">
                + New Adjustment
              </Link>
            }
          />

          <DataTableToolbar>
            <FilterDropdown
              label="All Movement Types"
              value={movementType}
              onChange={(v) => {
                setMovementType(v);
                setPage(1);
              }}
              options={[
                { label: 'Purchases (IN)', value: 'PURCHASE' },
                { label: 'Sales (OUT)', value: 'SALE' },
                { label: 'Sales Return (IN)', value: 'SALES_RETURN' },
                { label: 'Purchase Return (OUT)', value: 'PURCHASE_RETURN' },
                { label: 'Manual Adjustment IN', value: 'ADJUSTMENT_IN' },
                { label: 'Manual Adjustment OUT', value: 'ADJUSTMENT_OUT' },
                { label: 'Opening Stock', value: 'OPENING_STOCK' },
              ]}
            />
          </DataTableToolbar>

          {movementsQuery.isLoading ? (
            <LoadingSpinner label="Loading stock movement audit records…" />
          ) : movementsQuery.error ? (
            <div className="error">{movementsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Date',
                  'Product',
                  'SKU',
                  'Movement Type',
                  'Quantity Change',
                  'Unit Cost',
                  'Reason / Context',
                  'Reference',
                ]}
              >
                {movementsQuery.data?.data.length ? (
                  movementsQuery.data.data.map((m: any) => {
                    const isPositive = Number(m.quantity) > 0;
                    return (
                      <tr key={m.id}>
                        <td>
                          <DateDisplay value={m.movementDate} />
                        </td>
                        <td>
                          <strong>{m.product?.name || '—'}</strong>
                        </td>
                        <td>
                          <code>{m.product?.sku || '—'}</code>
                        </td>
                        <td>
                          <StatusBadge value={m.type} />
                        </td>
                        <td>
                          <strong style={{ color: isPositive ? '#188b64' : '#bd5664' }}>
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </strong>
                        </td>
                        <td>
                          {m.unitCost ? <CurrencyDisplay value={m.unitCost} /> : '—'}
                        </td>
                        <td>
                          {m.reason || '—'}
                          {m.note && <small style={{ display: 'block', color: '#8890a5' }}>{m.note}</small>}
                        </td>
                        <td>
                          <code style={{ fontSize: 11 }}>{m.referenceType || 'MANUAL'}</code>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <EmptyTableState message="No stock movements found." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={movementsQuery.data?.meta.total || 0}
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
