'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
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
  const inventoryReportQuery = useQuery({
    queryKey: ['inventory-report'],
    queryFn: () => api<any>('/reports/inventory'),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Inventory Valuation & Stock Health Report"
            description="Catalog-wide audit of stock quantities, Weighted Average Cost valuations and safety thresholds."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Reports', href: '/dashboard/reports' },
              { label: 'Inventory' },
            ]}
          />

          {inventoryReportQuery.isLoading ? (
            <LoadingSpinner label="Auditing warehouse catalog valuations…" />
          ) : inventoryReportQuery.error ? (
            <ErrorState message={inventoryReportQuery.error.message} onRetry={() => inventoryReportQuery.refetch()} />
          ) : (
            <>
              <StatCardGrid columns={3}>
                <StatCard
                  label="Total Stock Quantity"
                  value={`${inventoryReportQuery.data.totalQuantity} units`}
                  detail={`${inventoryReportQuery.data.totalProducts} catalog products`}
                  icon={<Boxes color="#5068e6" size={20} />}
                  kind="blue"
                />
                <StatCard
                  label="Total Stock Asset Valuation"
                  value={<CurrencyDisplay value={inventoryReportQuery.data.totalValuation} />}
                  detail="Calculated from Weighted Average Cost"
                  icon={<Coins color="#28a476" size={20} />}
                  kind="green"
                />
                <StatCard
                  label="Average Item Valuation"
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
                  detail="Weighted Average Unit Cost"
                  kind="blue"
                />
              </StatCardGrid>

              <div style={{ marginTop: 16 }}>
                <DataTable
                  columns={[
                    'Product Name',
                    'SKU',
                    'Category',
                    'Current Stock',
                    'Avg Unit Cost',
                    'Total Valuation',
                    'Min / Max Threshold',
                    'Status',
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
                        <EmptyTableState message="No inventory products found." />
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
