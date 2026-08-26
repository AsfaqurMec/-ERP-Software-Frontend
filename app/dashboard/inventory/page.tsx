'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
import { useTranslation } from '../../../provider';
import {
  CurrencyDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  StatCard,
  StatCardGrid,
  ErrorState,
} from '../../../components/ui';
import { Package, Coins, AlertTriangle, XCircle, TrendingUp, ArrowRight } from 'lucide-react';

export default function InventoryOverviewPage() {
  const { t } = useTranslation();
  const overviewQuery = useQuery({
    queryKey: ['inventory-overview'],
    queryFn: () => api<any>('/inventory/overview'),
  });

  if (overviewQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label={t('common.loading')} />
        </Shell>
      </AuthGuard>
    );
  }

  if (overviewQuery.error) {
    return (
      <AuthGuard>
        <Shell>
          <ErrorState message={overviewQuery.error.message} onRetry={() => overviewQuery.refetch()} />
        </Shell>
      </AuthGuard>
    );
  }

  const d = overviewQuery.data || {
    totalStock: 0,
    stockValue: 0,
    lowStock: 0,
    outOfStock: 0,
    overstocked: 0,
  };

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('inventory.stock_position')}
            description={t('inventory.stock_position_desc')}
            breadcrumbs={[{ label: t('common.dashboard'), href: '/dashboard' }, { label: t('inventory.stock_position') }]}
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <Link className="ghost" href="/dashboard/inventory/movements">
                  {t('inventory.stock_movements')}
                </Link>
                <Link className="primary-button" href="/dashboard/inventory/adjustments">
                  {t('inventory.adjust_stock_btn')}
                </Link>
              </div>
            }
          />

          {/* 5 Core Health Metric Cards */}
          <StatCardGrid columns={5}>
            <StatCard
              label={t('products.stock_units')}
              value={`${d.totalStock} ${t('products.units')}`}
              detail={t('dashboard.units_in_stock')}
              icon={<Package color="#5068e6" size={20} />}
              kind="blue"
            />
            <StatCard
              label={t('products.stock_value')}
              value={<CurrencyDisplay value={d.stockValue} />}
              detail={t('reports.inventory_title')}
              icon={<Coins color="#28a476" size={20} />}
              kind="green"
            />
            <StatCard
              label={t('dashboard.low_stock')}
              value={d.lowStock}
              detail={t('products.low_stock_filter')}
              icon={<AlertTriangle color="#d28d2b" size={20} />}
              kind="amber"
            />
            <StatCard
              label={t('dashboard.out_of_stock')}
              value={d.outOfStock}
              detail={t('products.out_of_stock_filter')}
              icon={<XCircle color="#ef4444" size={20} />}
              kind="rose"
            />
            <StatCard
              label={t('dashboard.overstocked')}
              value={d.overstocked}
              detail={t('products.overstocked_filter')}
              icon={<TrendingUp color="#5068e6" size={20} />}
              kind="blue"
            />
          </StatCardGrid>

          {/* Quick Nav Cards */}
          <div className="grid-2" style={{ marginTop: 10 }}>
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>{t('dashboard.inventory_health')}</h3>
                  <p>{t('dashboard.realtime_stock_status')}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <Link
                  href="/dashboard/products?stockStatus=low_stock"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>⚠️ {t('dashboard.low_stock')} ({d.lowStock})</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/products?stockStatus=out_of_stock"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>🚨 {t('dashboard.out_of_stock')} ({d.outOfStock})</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/products"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>📦 {t('products.title')}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            <section className="card">
              <div className="card-head">
                <div>
                  <h3>{t('inventory.stock_movements')}</h3>
                  <p>{t('inventory.stock_movements_desc')}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <Link
                  href="/dashboard/inventory/movements"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>📋 {t('inventory.stock_movements')}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/inventory/adjustments"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>⚖️ {t('inventory.stock_adjustment')}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/reports/inventory"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>📊 {t('reports.inventory_title')}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
