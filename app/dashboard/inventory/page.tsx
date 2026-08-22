'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
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
  const overviewQuery = useQuery({
    queryKey: ['inventory-overview'],
    queryFn: () => api<any>('/inventory/overview'),
  });

  if (overviewQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label="Auditing inventory metrics and valuations…" />
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

  const d = overviewQuery.data;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Inventory Overview"
            description="Live visibility of catalog stock positions, inventory valuation and health thresholds."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory' }]}
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <Link className="ghost" href="/dashboard/inventory/movements">
                  Movements Audit
                </Link>
                <Link className="primary-button" href="/dashboard/inventory/adjustments">
                  + Adjust Stock
                </Link>
              </div>
            }
          />

          {/* 5 Core Health Metric Cards */}
          <StatCardGrid columns={5}>
            <StatCard
              label="Total Stock Quantity"
              value={`${d.totalStock} units`}
              detail="Aggregate inventory count"
              icon={<Package color="#5068e6" size={20} />}
              kind="blue"
            />
            <StatCard
              label="Total Stock Value"
              value={<CurrencyDisplay value={d.stockValue} />}
              detail="Based on Weighted Avg Cost"
              icon={<Coins color="#28a476" size={20} />}
              kind="green"
            />
            <StatCard
              label="Low Stock Products"
              value={d.lowStock}
              detail="Below minimum threshold"
              icon={<AlertTriangle color="#d28d2b" size={20} />}
              kind="amber"
            />
            <StatCard
              label="Out of Stock"
              value={d.outOfStock}
              detail="Zero or negative stock"
              icon={<XCircle color="#ef4444" size={20} />}
              kind="rose"
            />
            <StatCard
              label="Overstocked Items"
              value={d.overstocked}
              detail="Above maximum capacity"
              icon={<TrendingUp color="#5068e6" size={20} />}
              kind="blue"
            />
          </StatCardGrid>

          {/* Quick Nav Cards */}
          <div className="grid-2" style={{ marginTop: 10 }}>
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>Stock Levels & Catalog Status</h3>
                  <p>Filter products by low stock, out of stock, or overstocked items</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <Link
                  href="/dashboard/products?stockStatus=low_stock"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>⚠️ Review Low Stock Items ({d.lowStock})</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/products?stockStatus=out_of_stock"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>🚨 Review Out of Stock Items ({d.outOfStock})</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/products"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>📦 Full Product Catalog</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>

            <section className="card">
              <div className="card-head">
                <div>
                  <h3>Stock Movement & Audit Trail</h3>
                  <p>Every purchase, sale, return and adjustment creates an immutable log</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <Link
                  href="/dashboard/inventory/movements"
                  className="ghost"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>📋 View All Stock Movements</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/inventory/adjustments"
                  className="primary-button"
                  style={{ justifyContent: 'space-between', padding: 14 }}
                >
                  <span>⚡ Create Manual Stock Adjustment</span>
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
