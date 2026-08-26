'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api, formatCurrency } from '../../../../lib/api';
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
import { useTranslation } from '../../../../provider';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const productQuery = useQuery({
    queryKey: ['product-detail', id],
    queryFn: () => api<any>(`/products/${id}`),
  });

  if (productQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label={t('common.loading')} />
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
            description={`SKU: ${p.sku} · ${t('products.category')}: ${p.category?.name || '—'}`}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('products.title'), href: '/dashboard/products' },
              { label: p.name },
            ]}
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <Link className="ghost" href={`/dashboard/inventory/adjustments`}>
                  {t('inventory.adjustments')}
                </Link>
                <Link className="primary-button" href={`/dashboard/products/${id}/edit`}>
                  {t('products.edit_product')}
                </Link>
              </div>
            }
          />

          {/* Key Metric Cards */}
          <StatCardGrid columns={4}>
            <StatCard
              label={t('inventory.current_stock')}
              value={`${p.stock} ${p.unit}`}
              detail={`${t('products.minimum_stock')}: ${p.minimumStock}`}
              icon={<Package color="#5068e6" size={20} />}
              kind="blue"
            />
            <StatCard
              label={t('inventory.stock_valuation')}
              value={<CurrencyDisplay value={p.summary.stockValue} />}
              detail={`${t('inventory.avg_cost', { defaultValue: 'Avg Cost' })}: ${formatCurrency(p.averageCost)}`}
              icon={<Coins color="#28a476" size={20} />}
              kind="green"
            />
            <StatCard
              label={t('reports.sales_revenue')}
              value={<CurrencyDisplay value={p.summary.revenue} />}
              detail={`${p.summary.totalSold} ${t('products.units')}`}
              icon={<ShoppingBag color="#d28d2b" size={20} />}
              kind="amber"
            />
            <StatCard
              label={t('reports.gross_profit')}
              value={<CurrencyDisplay value={p.summary.estimatedProfit} />}
              detail={t('reports.financial_overview')}
              icon={<TrendingUp color="#28a476" size={20} />}
              kind="green"
            />
          </StatCardGrid>

          {/* Details & Pricing */}
          <div className="detail-grid">
            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <h3 style={{ margin: 0 }}>{t('products.basic_info')}</h3>
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
                <dt>{t('products.sku')}</dt>
                <dd>
                  <code>{p.sku}</code>
                </dd>

                <dt>{t('products.barcode')}</dt>
                <dd>{p.barcode || '—'}</dd>

                <dt>{t('products.category')}</dt>
                <dd>{p.category?.name || '—'}</dd>

                <dt>{t('products.brand')}</dt>
                <dd>{p.brand || '—'}</dd>

                <dt>{t('products.supplier')}</dt>
                <dd>
                  {p.supplier ? (
                    <Link href={`/dashboard/suppliers/${p.supplier.id}`} style={{ color: '#5068e6' }}>
                      {p.supplier.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>

                <dt>{t('products.unit')}</dt>
                <dd>{p.unit}</dd>

                <dt>{t('common.status')}</dt>
                <dd>
                  <StatusBadge value={p.status} />
                </dd>

                <dt>{t('common.description')}</dt>
                <dd style={{ gridColumn: 'span 2' }}>{p.description || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <h3>{t('products.pricing_stock_policy')}</h3>
              <dl>
                <dt>{t('products.purchase_price')}</dt>
                <dd>
                  <CurrencyDisplay value={p.purchasePrice} />
                </dd>

                <dt>{t('products.selling_price')}</dt>
                <dd>
                  <strong>
                    <CurrencyDisplay value={p.sellingPrice} />
                  </strong>
                </dd>

                <dt>{t('reports.cogs')}</dt>
                <dd>
                  <CurrencyDisplay value={p.averageCost} />
                </dd>

                <dt>{t('products.wholesale_price')}</dt>
                <dd>{p.wholesalePrice ? <CurrencyDisplay value={p.wholesalePrice} /> : '—'}</dd>

                <dt>{t('purchases.title')}</dt>
                <dd>{p.summary.totalPurchased} {t('products.units')}</dd>

                <dt>{t('sales.title')}</dt>
                <dd>{p.summary.totalSold} {t('products.units')}</dd>

                <dt>{t('products.minimum_stock')}</dt>
                <dd>{p.minimumStock} {t('products.units')}</dd>

                <dt>{t('products.maximum_stock')}</dt>
                <dd>{p.maximumStock ? `${p.maximumStock}` : '—'}</dd>
              </dl>
            </section>
          </div>

          {/* Recent Stock Movements */}
          <section className="card">
            <div className="card-head">
              <div>
                <h3>{t('inventory.stock_movements')}</h3>
                <p>{t('inventory.audit_trail_desc')}</p>
              </div>
              <Link href={`/dashboard/inventory/movements?productId=${p.id}`} style={{ fontSize: 12, color: '#5068e6' }}>
                {t('inventory.stock_movements')} →
              </Link>
            </div>
            <DataTable
              columns={[
                t('common.date'),
                t('common.type'),
                t('documents.qty'),
                t('documents.unit_cost'),
                t('inventory.reason'),
                t('activity_logs.reference'),
              ]}
            >
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
                    {t('inventory.no_records')}
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
