'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  ErrorState,
} from '../../../components/ui';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Coins,
  Receipt,
  Boxes,
  Users,
  Store,
  Percent,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('this_month');
  const [customFrom, setCustomFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState<'overview' | 'products' | 'customers' | 'suppliers'>('overview');

  const queryParams = new URLSearchParams({
    timeframe,
    ...(timeframe === 'custom' ? { from: customFrom, to: customTo } : {}),
  });

  const analyticsQuery = useQuery({
    queryKey: ['deep-analytics', queryParams.toString()],
    queryFn: () => api<any>(`/analytics/deep?${queryParams}`),
  });

  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Business Intelligence & Analytics"
            description="Deep analytics across sales velocity, procurement, margins, customer lifetime value and product performance."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
            action={
              <div style={{ display: 'flex', gap: 6, background: '#f0f2f8', padding: 4, borderRadius: 8 }}>
                {timeframes.map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setTimeframe(tf.id)}
                    style={{
                      border: 0,
                      background: timeframe === tf.id ? '#fff' : 'transparent',
                      color: timeframe === tf.id ? '#5068e6' : '#6b7280',
                      fontWeight: timeframe === tf.id ? 700 : 500,
                      fontSize: 12,
                      padding: '6px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      boxShadow: timeframe === tf.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            }
          />

          {timeframe === 'custom' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', padding: 14, borderRadius: 10, border: '1px solid #edf0f7', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Custom Interval:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>
          )}

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', marginBottom: 20 }}>
            {[
              { id: 'overview', label: 'Financial & Velocity Overview' },
              { id: 'products', label: 'Product & Catalog Intelligence' },
              { id: 'customers', label: 'Customer Cohorts & Receivables' },
              { id: 'suppliers', label: 'Supplier Procurement Analytics' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                style={{
                  border: 0,
                  background: 'transparent',
                  padding: '10px 16px',
                  fontWeight: tab === t.id ? 700 : 500,
                  fontSize: 14,
                  color: tab === t.id ? '#5068e6' : '#64748b',
                  borderBottom: tab === t.id ? '2px solid #5068e6' : '2px solid transparent',
                  marginBottom: -2,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {analyticsQuery.isLoading ? (
            <LoadingSpinner label="Computing multi-dimensional business analytics…" />
          ) : analyticsQuery.error ? (
            <ErrorState message={analyticsQuery.error.message} onRetry={() => analyticsQuery.refetch()} />
          ) : (
            <>
              {tab === 'overview' && (
                <div style={{ display: 'grid', gap: 20 }}>
                  {/* Sales Metrics Grid */}
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 10, color: '#334155' }}>Sales Performance Metrics</h3>
                    <StatCardGrid columns={4}>
                      <StatCard
                        label="Total Sales Revenue"
                        value={<CurrencyDisplay value={analyticsQuery.data.sales.totalRevenue} />}
                        detail={`${analyticsQuery.data.sales.totalOrders} orders completed`}
                        icon={<ShoppingBag color="#5068e6" size={20} />}
                        kind="blue"
                      />
                      <StatCard
                        label="Average Order Value (AOV)"
                        value={<CurrencyDisplay value={analyticsQuery.data.sales.averageOrderValue} />}
                        detail="Per completed invoice"
                        icon={<Coins color="#28a476" size={20} />}
                        kind="green"
                      />
                      <StatCard
                        label="Items Sold Volume"
                        value={`${analyticsQuery.data.sales.itemsSold} units`}
                        detail={`Paid: ${analyticsQuery.data.sales.paidSales} | Credit: ${analyticsQuery.data.sales.creditSales}`}
                        icon={<Boxes color="#d28d2b" size={20} />}
                        kind="amber"
                      />
                      <StatCard
                        label="Sales Returns Deductions"
                        value={<CurrencyDisplay value={analyticsQuery.data.sales.totalSalesReturns} />}
                        detail="Credited returns"
                        icon={<Percent color="#ef4444" size={20} />}
                        kind="rose"
                      />
                    </StatCardGrid>
                  </div>

                  {/* Margins & Profitability */}
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 10, color: '#334155' }}>Profitability & Operating Margins</h3>
                    <StatCardGrid columns={4}>
                      <StatCard
                        label="Cost of Goods (COGS)"
                        value={<CurrencyDisplay value={analyticsQuery.data.profit.cogs} />}
                        detail="Weighted Average Cost"
                        icon={<Package color="#71798d" size={20} />}
                        kind="blue"
                      />
                      <StatCard
                        label="Gross Profit & Margin"
                        value={<CurrencyDisplay value={analyticsQuery.data.profit.grossProfit} />}
                        detail={`Gross Margin: ${analyticsQuery.data.profit.grossMarginPct}%`}
                        icon={<TrendingUp color="#28a476" size={20} />}
                        kind="green"
                      />
                      <StatCard
                        label="Operating Expenses"
                        value={<CurrencyDisplay value={analyticsQuery.data.profit.expenses} />}
                        detail="All facilities & overheads"
                        icon={<Receipt color="#ef4444" size={20} />}
                        kind="rose"
                      />
                      <StatCard
                        label="Net Profit & Margin"
                        value={<CurrencyDisplay value={analyticsQuery.data.profit.netProfit} />}
                        detail={`Net Margin: ${analyticsQuery.data.profit.netMarginPct}%`}
                        icon={<Coins color={Number(analyticsQuery.data.profit.netProfit) >= 0 ? '#28a476' : '#ef4444'} size={20} />}
                        kind={Number(analyticsQuery.data.profit.netProfit) >= 0 ? 'green' : 'rose'}
                      />
                    </StatCardGrid>
                  </div>

                  {/* Inventory Health */}
                  <div>
                    <h3 style={{ fontSize: 15, marginBottom: 10, color: '#334155' }}>Inventory Health & Asset Positions</h3>
                    <StatCardGrid columns={4}>
                      <StatCard
                        label="Total Stock Valuation"
                        value={<CurrencyDisplay value={analyticsQuery.data.inventory.stockValue} />}
                        detail={`${analyticsQuery.data.inventory.totalStock} units on hand`}
                        icon={<Boxes color="#5068e6" size={20} />}
                        kind="blue"
                      />
                      <StatCard
                        label="Low Stock Alerts"
                        value={analyticsQuery.data.inventory.lowStock}
                        detail="Below safety minimum"
                        icon={<TrendingUp color="#d28d2b" size={20} />}
                        kind="amber"
                      />
                      <StatCard
                        label="Out of Stock Items"
                        value={analyticsQuery.data.inventory.outOfStock}
                        detail="Immediate reorder needed"
                        icon={<Percent color="#ef4444" size={20} />}
                        kind="rose"
                      />
                      <StatCard
                        label="Dead Stock Items"
                        value={analyticsQuery.data.inventory.deadStock?.length || 0}
                        detail="Zero sales in interval"
                        icon={<Package color="#71798d" size={20} />}
                        kind="blue"
                      />
                    </StatCardGrid>
                  </div>
                </div>
              )}

              {tab === 'products' && (
                <div style={{ display: 'grid', gap: 20 }}>
                  <section className="card">
                    <h3>Top Selling Products (By Volume Sold)</h3>
                    <DataTable columns={['Product', 'SKU', 'Category', 'Units Sold', 'Total Revenue', 'Profit Contribution']}>
                      {analyticsQuery.data.rankings.topSelling.map((p: any) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                          </td>
                          <td>
                            <code>{p.sku}</code>
                          </td>
                          <td>{p.category}</td>
                          <td>
                            <strong>{p.quantitySold} units</strong>
                          </td>
                          <td>
                            <CurrencyDisplay value={p.revenue} />
                          </td>
                          <td>
                            <strong style={{ color: '#188b64' }}>
                              <CurrencyDisplay value={p.profit} />
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </section>

                  <section className="card">
                    <h3>Most Profitable Products</h3>
                    <DataTable columns={['Product', 'SKU', 'Category', 'Gross Profit Earned', 'Revenue', 'Units Sold']}>
                      {analyticsQuery.data.rankings.mostProfitable.map((p: any) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                          </td>
                          <td>
                            <code>{p.sku}</code>
                          </td>
                          <td>{p.category}</td>
                          <td>
                            <strong style={{ color: '#188b64' }}>
                              <CurrencyDisplay value={p.profit} />
                            </strong>
                          </td>
                          <td>
                            <CurrencyDisplay value={p.revenue} />
                          </td>
                          <td>{p.quantitySold} units</td>
                        </tr>
                      ))}
                    </DataTable>
                  </section>
                </div>
              )}

              {tab === 'customers' && (
                <div style={{ display: 'grid', gap: 20 }}>
                  <section className="card">
                    <h3>Top Customers by Lifetime Sales</h3>
                    <DataTable columns={['Customer', 'Phone', 'Total Sales Volume', 'Completed Invoices', 'Outstanding Due Balance']}>
                      {analyticsQuery.data.customerAnalytics.topBySales.map((c: any) => (
                        <tr key={c.id}>
                          <td>
                            <Link href={`/dashboard/customers/${c.id}`} style={{ color: '#5068e6', fontWeight: 600 }}>
                              {c.name}
                            </Link>
                          </td>
                          <td>{c.phone || '—'}</td>
                          <td>
                            <strong>
                              <CurrencyDisplay value={c.totalSales} />
                            </strong>
                          </td>
                          <td>{c.orderCount} orders</td>
                          <td>
                            <span style={{ color: Number(c.dueBalance) > 0 ? '#ef4444' : '#188b64', fontWeight: 600 }}>
                              <CurrencyDisplay value={c.dueBalance} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </section>
                </div>
              )}

              {tab === 'suppliers' && (
                <div style={{ display: 'grid', gap: 20 }}>
                  <section className="card">
                    <h3>Top Suppliers by Purchase Value</h3>
                    <DataTable columns={['Supplier Name', 'Company', 'Total Procurement Volume', 'Purchase Orders', 'Outstanding Payable']}>
                      {analyticsQuery.data.supplierAnalytics.topByPurchase.map((s: any) => (
                        <tr key={s.id}>
                          <td>
                            <Link href={`/dashboard/suppliers/${s.id}`} style={{ color: '#5068e6', fontWeight: 600 }}>
                              {s.name}
                            </Link>
                          </td>
                          <td>{s.company || '—'}</td>
                          <td>
                            <strong>
                              <CurrencyDisplay value={s.totalPurchases} />
                            </strong>
                          </td>
                          <td>{s.orderCount} POs</td>
                          <td>
                            <span style={{ color: Number(s.dueBalance) > 0 ? '#ef4444' : '#188b64', fontWeight: 600 }}>
                              <CurrencyDisplay value={s.dueBalance} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  </section>
                </div>
              )}
            </>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
