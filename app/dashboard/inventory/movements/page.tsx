'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import { useTranslation } from '../../../../provider';
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
  const { t } = useTranslation();
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
            title={t('inventory.stock_movements')}
            description={t('inventory.stock_movements_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('inventory.stock_position'), href: '/dashboard/inventory' },
              { label: t('inventory.stock_movements') },
            ]}
            action={
              <Link className="primary-button" href="/dashboard/inventory/adjustments">
                {t('inventory.new_adjustment_btn')}
              </Link>
            }
          />

          <DataTableToolbar>
            <FilterDropdown
              label={t('inventory.all_movement_types')}
              value={movementType}
              onChange={(v) => {
                setMovementType(v);
                setPage(1);
              }}
              options={[
                { label: `${t('status.purchase')} (${t('status.in')})`, value: 'PURCHASE' },
                { label: `${t('status.sale')} (${t('status.out')})`, value: 'SALE' },
                { label: `${t('status.sales_return')} (${t('status.in')})`, value: 'SALES_RETURN' },
                { label: `${t('status.purchase_return')} (${t('status.out')})`, value: 'PURCHASE_RETURN' },
                { label: t('status.adjustment_in'), value: 'ADJUSTMENT_IN' },
                { label: t('status.adjustment_out'), value: 'ADJUSTMENT_OUT' },
                { label: t('inventory.reason_opening'), value: 'OPENING_STOCK' },
              ]}
            />
          </DataTableToolbar>

          {movementsQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : movementsQuery.error ? (
            <div className="error">{movementsQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('common.date'),
                  t('inventory.product'),
                  t('products.sku'),
                  t('inventory.movement_type'),
                  t('inventory.quantity'),
                  t('inventory.unit_cost'),
                  t('inventory.reason'),
                  t('common.id'),
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
                      <EmptyTableState message={t('inventory.no_movements_found')} />
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
