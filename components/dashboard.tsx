'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, money } from '../lib/api';
import {
  ArrowUpRight,
  Package,
  ShoppingBag,
  WalletCards,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowDownRight,
} from 'lucide-react';
import {
  StatCard,
  StatCardGrid,
  ChartCard,
  LoadingSpinner,
  ErrorState,
  StatusBadge,
} from './ui';
import { AppAreaChart, AppBarChart, AppPieChart } from './charts';

import { useTranslation } from '../provider';

interface AnalyticsData {
  kpis: {
    totalProducts: number;
    totalStock: number;
    stockValue: number;
    todaySales: number;
    todayPurchases: number;
    todayGrossProfit: number;
    receivable: number;
    payable: number;
    lowStock: number;
    outOfStock: number;
    overstocked: number;
  };
  profit: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
  };
  salesTimeSeries: {
    daily: { label: string; revenue: number }[];
    weekly: { label: string; revenue: number }[];
    monthly: { label: string; revenue: number }[];
    yearly: { label: string; revenue: number }[];
  };
  purchasesTimeSeries: {
    daily: { label: string; revenue: number }[];
    monthly: { label: string; revenue: number }[];
    yearly: { label: string; revenue: number }[];
  };
  productPerformance: {
    topSelling: { id: string; name: string; sku: string; unitsSold: number; revenue: number; profit: number }[];
    mostProfitable: { id: string; name: string; sku: string; unitsSold: number; revenue: number; profit: number }[];
    slowMoving: { id: string; name: string; sku: string; unitsSold: number; revenue: number; profit: number }[];
  };
  categoryPerformance: {
    categoryId: string;
    name: string;
    productCount: number;
    sales: number;
    purchases: number;
    profit: number;
  }[];
}

export function DashboardView() {
  const { t } = useTranslation();
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [purchasesPeriod, setPurchasesPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [productTab, setProductTab] = useState<'topSelling' | 'mostProfitable' | 'slowMoving'>('topSelling');

  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['dashboard-analytics'],
    queryFn: () => api<AnalyticsData>('/analytics/dashboard'),
  });

  if (isLoading) {
    return <LoadingSpinner label={t('dashboard.live_intel_loading')} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  const d = data || {
    kpis: {
      totalProducts: 0,
      totalStock: 0,
      stockValue: 0,
      todaySales: 0,
      todayPurchases: 0,
      todayGrossProfit: 0,
      receivable: 0,
      payable: 0,
      lowStock: 0,
      outOfStock: 0,
      overstocked: 0,
    },
    profit: {
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      expenses: 0,
      netProfit: 0,
    },
    salesTimeSeries: { daily: [], weekly: [], monthly: [], yearly: [] },
    purchasesTimeSeries: { daily: [], monthly: [], yearly: [] },
    productPerformance: { topSelling: [], mostProfitable: [], slowMoving: [] },
    categoryPerformance: [],
  };

  const salesChartData = d.salesTimeSeries?.[salesPeriod] || [];
  const purchasesChartData = d.purchasesTimeSeries?.[purchasesPeriod] || [];

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* 1. Top KPI Stat Grid */}
      <StatCardGrid columns={4}>
        <StatCard
          label={t('dashboard.total_stock_value')}
          value={money(d.kpis?.stockValue || 0)}
          detail={`${d.kpis?.totalProducts || 0} ${t('dashboard.total_catalog_products')}`}
          icon={<WalletCards color="#5068e6" size={20} />}
          kind="blue"
        />
        <StatCard
          label={t('dashboard.today_sales')}
          value={money(d.kpis?.todaySales || 0)}
          detail={`${t('dashboard.gross_profit')}: ${money(d.kpis?.todayGrossProfit || 0)}`}
          icon={<ShoppingBag color="#28a476" size={20} />}
          kind="green"
        />
        <StatCard
          label={t('dashboard.today_purchases')}
          value={money(d.kpis?.todayPurchases || 0)}
          detail={t('dashboard.supplier_procurement')}
          icon={<Package color="#d28d2b" size={20} />}
          kind="amber"
        />
        <StatCard
          label={t('dashboard.receivable_due')}
          value={money(d.kpis?.receivable || 0)}
          detail={`${t('dashboard.payables_to_suppliers')}: ${money(d.kpis?.payable || 0)}`}
          icon={<TrendingUp color="#d96a77" size={20} />}
          kind="rose"
        />
      </StatCardGrid>

      {/* 2. Sales Overview (with Range Switcher) & Profit Snapshot */}
      <div className="grid-2">
        <ChartCard
          title={t('dashboard.sales_overview')}
          subtitle={`${t('dashboard.revenue_performance')} (${salesPeriod})`}
          action={
            <div style={{ display: 'flex', gap: 4, background: '#f0f2f8', padding: 3, borderRadius: 8 }}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSalesPeriod(p)}
                  style={{
                    border: 0,
                    background: salesPeriod === p ? '#fff' : 'transparent',
                    color: salesPeriod === p ? '#5068e6' : '#6b7280',
                    fontWeight: salesPeriod === p ? 700 : 500,
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: salesPeriod === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <AppAreaChart data={salesChartData} dataKey="revenue" strokeColor="#5068e6" fillColor="#5068e6" />
        </ChartCard>

        {/* Profit Overview Card */}
        <section className="card profit">
          <div className="card-head">
            <div>
              <h3>{t('dashboard.profit_snapshot')}</h3>
              <p>{t('dashboard.confirmed_ledger_breakdown')}</p>
            </div>
            <span className={`pill ${(d.profit?.netProfit || 0) >= 0 ? 'success' : 'status unpaid'}`}>
              {(d.profit?.netProfit || 0) >= 0 ? t('dashboard.profitable') : t('dashboard.net_loss')}
            </span>
          </div>
          {[
            [t('dashboard.total_revenue'), d.profit?.revenue || 0, false],
            [t('dashboard.cost_of_goods_sold'), d.profit?.cogs || 0, false],
            [t('dashboard.gross_profit'), d.profit?.grossProfit || 0, true],
            [t('dashboard.operating_expenses'), d.profit?.expenses || 0, false],
            [t('dashboard.net_profit'), d.profit?.netProfit || 0, true],
          ].map(([k, v, isEmphasis], i) => (
            <div className={isEmphasis ? 'emphasis row' : 'row'} key={k as string}>
              <span>{k as string}</span>
              <strong>{money(v as number)}</strong>
            </div>
          ))}
        </section>
      </div>

      {/* 3. Purchase Overview & Category Performance */}
      <div className="grid-2">
        <ChartCard
          title={t('dashboard.purchase_overview')}
          subtitle={`${t('dashboard.supplier_procurement')} (${purchasesPeriod})`}
          action={
            <div style={{ display: 'flex', gap: 4, background: '#f0f2f8', padding: 3, borderRadius: 8 }}>
              {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurchasesPeriod(p)}
                  style={{
                    border: 0,
                    background: purchasesPeriod === p ? '#fff' : 'transparent',
                    color: purchasesPeriod === p ? '#d28d2b' : '#6b7280',
                    fontWeight: purchasesPeriod === p ? 700 : 500,
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: purchasesPeriod === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <AppAreaChart data={purchasesChartData} dataKey="revenue" strokeColor="#d28d2b" fillColor="#d28d2b" />
        </ChartCard>

        {/* Category Performance Breakdown */}
        <ChartCard title={t('dashboard.category_performance')} subtitle={t('dashboard.sales_and_profit_by_category')}>
          <AppBarChart
            data={d.categoryPerformance || []}
            dataKeys={[
              { key: 'sales', color: '#5068e6', label: t('dashboard.revenue') },
              { key: 'profit', color: '#28a476', label: t('dashboard.profit') },
            ]}
            xAxisKey="name"
          />
        </ChartCard>
      </div>

      {/* 4. Inventory Health & Product Performance Tabs */}
      <div className="grid-2 lower">
        <section className="card">
          <div className="card-head">
            <div>
              <h3>{t('dashboard.inventory_health')}</h3>
              <p>{t('dashboard.realtime_stock_status')}</p>
            </div>
            <a href="/dashboard/inventory" style={{ fontSize: 12, color: '#5068e6', fontWeight: 600 }}>
              {t('dashboard.inventory_overview')} →
            </a>
          </div>
          <div className="inventory" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div>
              <strong>{d.kpis?.totalStock || 0}</strong>
              <span>{t('dashboard.units_in_stock')}</span>
            </div>
            <div>
              <strong style={{ color: (d.kpis?.lowStock || 0) > 0 ? '#d28d2b' : 'inherit' }}>{d.kpis?.lowStock || 0}</strong>
              <span>{t('dashboard.low_stock')}</span>
            </div>
            <div>
              <strong style={{ color: (d.kpis?.outOfStock || 0) > 0 ? '#ef4444' : 'inherit' }}>{d.kpis?.outOfStock || 0}</strong>
              <span>{t('dashboard.out_of_stock')}</span>
            </div>
            <div>
              <strong>{d.kpis?.overstocked || 0}</strong>
              <span>{t('dashboard.overstocked')}</span>
            </div>
          </div>
        </section>

        {/* Product Performance (Top Selling / Most Profitable / Slow-Moving) */}
        <section className="card">
          <div className="card-head">
            <div>
              <h3>{t('dashboard.product_performance')}</h3>
              <p>{t('dashboard.actionable_item_insights')}</p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#f0f2f8', padding: 3, borderRadius: 8 }}>
              {[
                { id: 'topSelling', label: t('dashboard.top_selling') },
                { id: 'mostProfitable', label: t('dashboard.most_profitable') },
                { id: 'slowMoving', label: t('dashboard.slow_moving') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProductTab(tab.id as any)}
                  style={{
                    border: 0,
                    background: productTab === tab.id ? '#fff' : 'transparent',
                    color: productTab === tab.id ? '#5068e6' : '#6b7280',
                    fontWeight: productTab === tab.id ? 700 : 500,
                    fontSize: 11,
                    padding: '4px 7px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: productTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            {(d.productPerformance?.[productTab] || []).length ? (
              (d.productPerformance?.[productTab] || []).map((p, i) => (
                <div className="rank" key={p.id}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.sku} · {p.unitsSold} {t('dashboard.units_sold')}
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b>{productTab === 'mostProfitable' ? money(p.profit) : money(p.revenue)}</b>
                    <small style={{ display: 'block', fontSize: 10, color: '#8890a5' }}>
                      {productTab === 'mostProfitable' ? t('dashboard.profit') : t('dashboard.revenue')}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">{t('dashboard.no_products_category')}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
