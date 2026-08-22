'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import {
  CurrencyDisplay,
  DateDisplay,
  DataTable,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  StatusBadge,
  ErrorState,
} from '../../../../components/ui';
import { Package, ShoppingBag, Coins, TrendingUp } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const productQuery = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => api<any>(`/products/${id}`),
  });

  if (productQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label="Loading product specifications and ledger…" />
        </Shell>
      </AuthGuard>
    );
  }

  if (productQuery.error) {
    return (
      <AuthGuard>
        <Shell>
          <ErrorState message={productQuery.error.message} onRetry={() => productQuery.refetch()} />
        </Shell>
      </AuthGuard>
    );
  }

  const p = productQuery.data;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={p.name}
            description={`SKU: ${p.sku} · Category: ${p.category?.name || 'Uncategorized'}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Products', href: '/dashboard/products' },
              { label: p.name },
            ]}
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <Link className="ghost" href={`/dashboard/inventory/adjustments`}>
                  Adjust Stock
                </Link>
                <Link className="primary-button" href={`/dashboard/products/${id}/edit`}>
                  Edit Product
                </Link>
              </div>
            }
          />

          {/* Key Metric Cards */}
          <StatCardGrid columns={4}>
            <StatCard
              label="Current Stock"
              value={`${p.stock} ${p.unit}`}
              detail={`Threshold: ${p.minimumStock} min`}
              icon={<Package color="#5068e6" size={20} />}
              kind="blue"
            />
            <StatCard
              label="Stock Asset Value"
              value={<CurrencyDisplay value={p.summary.stockValue} />}
              detail={`Avg Cost: ${p.averageCost} BDT`}
              icon={<Coins color="#28a476" size={20} />}
              kind="green"
            />
            <StatCard
              label="Revenue Generated"
              value={<CurrencyDisplay value={p.summary.revenue} />}
              detail={`${p.summary.totalSold} units sold`}
              icon={<ShoppingBag color="#d28d2b" size={20} />}
              kind="amber"
            />
            <StatCard
              label="Estimated Gross Profit"
              value={<CurrencyDisplay value={p.summary.estimatedProfit} />}
              detail="Total Sales minus COGS"
              icon={<TrendingUp color="#28a476" size={20} />}
              kind="green"
            />
          </StatCardGrid>

          {/* Details & Pricing */}
          <div className="detail-grid">
            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <h3 style={{ margin: 0 }}>Basic Information</h3>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    }}
                  />
                )}
              </div>
              <dl>
                <dt>Product SKU</dt>
                <dd>
                  <code>{p.sku}</code>
                </dd>

                <dt>Barcode</dt>
                <dd>{p.barcode || '—'}</dd>

                <dt>Category</dt>
                <dd>{p.category?.name || '—'}</dd>

                <dt>Brand</dt>
                <dd>{p.brand || '—'}</dd>

                <dt>Primary Supplier</dt>
                <dd>
                  {p.supplier ? (
                    <Link href={`/dashboard/suppliers/${p.supplier.id}`} style={{ color: '#5068e6' }}>
                      {p.supplier.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>

                <dt>Unit</dt>
                <dd>{p.unit}</dd>

                <dt>Status</dt>
                <dd>
                  <StatusBadge value={p.status} />
                </dd>

                <dt>Description</dt>
                <dd style={{ gridColumn: 'span 2' }}>{p.description || 'No description provided.'}</dd>
              </dl>
            </section>

            <section className="card">
              <h3>Pricing & Profit Summary</h3>
              <dl>
                <dt>Purchase Cost Price</dt>
                <dd>
                  <CurrencyDisplay value={p.purchasePrice} />
                </dd>

                <dt>Selling Price</dt>
                <dd>
                  <strong>
                    <CurrencyDisplay value={p.sellingPrice} />
                  </strong>
                </dd>

                <dt>Weighted Average Cost</dt>
                <dd>
                  <CurrencyDisplay value={p.averageCost} />
                </dd>

                <dt>Wholesale Price</dt>
                <dd>{p.wholesalePrice ? <CurrencyDisplay value={p.wholesalePrice} /> : '—'}</dd>

                <dt>Total Units Purchased</dt>
                <dd>{p.summary.totalPurchased} units</dd>

                <dt>Total Units Sold</dt>
                <dd>{p.summary.totalSold} units</dd>

                <dt>Reorder Threshold (Min)</dt>
                <dd>{p.minimumStock} units</dd>

                <dt>Maximum Stock Capacity</dt>
                <dd>{p.maximumStock ? `${p.maximumStock} units` : 'Unlimited'}</dd>
              </dl>
            </section>
          </div>

          {/* Recent Stock Movements */}
          <section className="card">
            <div className="card-head">
              <div>
                <h3>Recent Stock Movements</h3>
                <p>Accountable audit trail for this product</p>
              </div>
              <Link href={`/dashboard/inventory/movements?productId=${p.id}`} style={{ fontSize: 12, color: '#5068e6' }}>
                View all movements →
              </Link>
            </div>
            <DataTable columns={['Date', 'Type', 'Quantity', 'Unit Cost', 'Reason', 'Reference']}>
              {p.movements && p.movements.length ? (
                p.movements.map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      <DateDisplay value={m.movementDate} />
                    </td>
                    <td>
                      <StatusBadge value={m.type} />
                    </td>
                    <td>
                      <strong style={{ color: Number(m.quantity) > 0 ? '#188b64' : '#bd5664' }}>
                        {Number(m.quantity) > 0 ? `+${m.quantity}` : m.quantity}
                      </strong>
                    </td>
                    <td>{m.unitCost ? <CurrencyDisplay value={m.unitCost} /> : '—'}</td>
                    <td>{m.reason || '—'}</td>
                    <td>
                      <code>{m.referenceType || 'MANUAL'}</code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty">
                    No stock movements recorded yet for this product.
                  </td>
                </tr>
              )}
            </DataTable>
          </section>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
