'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import { useTranslation } from '../../../../provider';
import {
  CurrencyDisplay,
  DataTable,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  StatusBadge,
  ErrorState,
} from '../../../../components/ui';
import { Boxes, Coins, AlertTriangle, XCircle } from 'lucide-react';

export default function InventoryReportPage() {
  const { t } = useTranslation();
  const inventoryReportQuery = useQuery({
    queryKey: ['inventory-report'],
    queryFn: () => api<any>('/reports/inventory'),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('reports.inventory_title')}
            description={t('reports.inventory_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('reports.title'), href: '/dashboard/reports' },
              { label: t('reports.inventory_title') },
            ]}
          />

          {inventoryReportQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : inventoryReportQuery.error ? (
            <ErrorState message={inventoryReportQuery.error.message} onRetry={() => inventoryReportQuery.refetch()} />
          ) : (
            <>
              <StatCardGrid columns={3}>
                <StatCard
                  label={t('products.stock_units')}
                  value={`${inventoryReportQuery.data.totalQuantity} ${t('products.units')}`}
                  detail={`${inventoryReportQuery.data.totalProducts} ${t('dashboard.total_catalog_products')}`}
                  icon={<Boxes color="#5068e6" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label={t('products.stock_value')}
                  value={<CurrencyDisplay value={inventoryReportQuery.data.totalValuation} />}
                  detail={t('reports.inventory_title')}
                  icon={<Coins color="#28a476" size={20} />}
                  kind="green"
                />
                <StatCard
                  label={t('products.purchase_price')}
                  value={
                    <CurrencyDisplay
                      value={
                        inventoryReportQuery.data.totalQuantity > 0
                          ? Number(inventoryReportQuery.data.totalValuation) /
                            Number(inventoryReportQuery.data.totalQuantity)
                          : 0
                      }
                    />
                  }
                  detail={t('products.purchase_price')}
                  kind="blue"
                />
              </StatCardGrid>

              <div style={{ marginTop: 16 }}>
                <DataTable
                  columns={[
                    t('products.name'),
                    t('products.sku'),
                    t('products.category'),
                    t('inventory.current_stock'),
                    t('products.purchase_price'),
                    t('products.stock_value'),
                    `${t('products.min_stock')} / ${t('products.max_stock')}`,
                    t('common.status'),
                  ]}
                >
                  {inventoryReportQuery.data.products?.length ? (
                    inventoryReportQuery.data.products.map((p: any) => {
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
                            <strong style={{ color: isOut ? '#ef4444' : isLow ? '#d28d2b' : '#188b64' }}>
                              {p.stock} {p.unit}
                            </strong>
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
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <EmptyTableState message={t('products.no_products_found')} />
                      </td>
                    </tr>
                  )}
                </DataTable>
              </div>
            </>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
