'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api, extractItems } from '../../../../lib/api';
import {
  FormActions,
  FormField,
  FormSection,
  LoadingSpinner,
  PageContainer,
  PageHeader,
} from '../../../../components/ui';

export default function AdjustmentsPage() {
  const router = useRouter();

  const productsQuery = useQuery({
    queryKey: ['product-options-adjustment'],
    queryFn: () => api('/products?limit=200'),
  });

  const [data, setData] = useState({
    productId: '',
    type: 'IN',
    quantity: '',
    unitCost: '',
    reason: 'Manual Correction',
    note: '',
    date: new Date().toISOString().slice(0, 16),
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!data.productId) {
      setError('Please select a product.');
      return;
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload: Record<string, any> = {
        productId: data.productId,
        type: data.type,
        quantity: Number(data.quantity),
        reason: data.reason,
        note: data.note || undefined,
        date: new Date(data.date).toISOString(),
      };

      if (data.type === 'IN' && data.unitCost) {
        payload.unitCost = Number(data.unitCost);
      }

      await api('/inventory/adjustments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push('/dashboard/inventory/movements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adjustment failed.');
    } finally {
      setSaving(false);
    }
  }

  const products = extractItems<any>(productsQuery.data);
  const selectedProduct = products.find((p) => p.id === data.productId);

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Stock Adjustment"
            description="Manually adjust inventory for damages, losses, found items, or opening stock."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Inventory', href: '/dashboard/inventory' },
              { label: 'Adjust Stock' },
            ]}
          />

          {productsQuery.isLoading ? (
            <LoadingSpinner label="Loading products…" />
          ) : (
            <form className="record-form" onSubmit={submit}>
              <FormSection title="Adjustment Specifications">
                <div className="form-grid">
                  <FormField label="Select Product" required>
                    <select
                      required
                      value={data.productId}
                      onChange={(e) => {
                        set('productId', e.target.value);
                        const prod = products.find((p) => p.id === e.target.value);
                        if (prod) {
                          set('unitCost', String(prod.averageCost || prod.purchasePrice));
                        }
                      }}
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — Available stock: {p.stock} {p.unit}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Adjustment Direction" required>
                    <select value={data.type} onChange={(e) => set('type', e.target.value)}>
                      <option value="IN">Stock In (Increase Inventory +)</option>
                      <option value="OUT">Stock Out (Decrease Inventory -)</option>
                    </select>
                  </FormField>

                  <FormField label="Adjustment Quantity" required>
                    <input
                      required
                      min="0.001"
                      step="0.001"
                      type="number"
                      value={data.quantity}
                      onChange={(e) => set('quantity', e.target.value)}
                      placeholder="0"
                    />
                  </FormField>

                  {data.type === 'IN' && (
                    <FormField label="Unit Cost Valuation (BDT)">
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={data.unitCost}
                        onChange={(e) => set('unitCost', e.target.value)}
                        placeholder="Cost per unit for Weighted Average Cost calculation"
                      />
                    </FormField>
                  )}

                  <FormField label="Reason for Adjustment" required>
                    <select value={data.reason} onChange={(e) => set('reason', e.target.value)}>
                      {[
                        'Damaged',
                        'Lost',
                        'Expired',
                        'Found',
                        'Opening Stock',
                        'Manual Correction',
                        'Other',
                      ].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Effective Date & Time" required>
                    <input
                      required
                      type="datetime-local"
                      value={data.date}
                      onChange={(e) => set('date', e.target.value)}
                    />
                  </FormField>
                </div>

                {selectedProduct && (
                  <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                    <strong>Selected Item:</strong> {selectedProduct.name} (SKU: {selectedProduct.sku}) ·{' '}
                    <span>Current Stock: <strong>{selectedProduct.stock} {selectedProduct.unit}</strong></span> ·{' '}
                    <span>Weighted Avg Cost: <strong>BDT {selectedProduct.averageCost}</strong></span>
                  </div>
                )}

                <FormField label="Additional Operational Note">
                  <textarea
                    value={data.note}
                    onChange={(e) => set('note', e.target.value)}
                    placeholder="Provide details about the physical audit or discrepancy…"
                  />
                </FormField>
              </FormSection>

              {error && <div className="form-error">{error}</div>}

              <FormActions>
                <button type="button" onClick={() => router.back()}>
                  Cancel
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? 'Processing…' : 'Apply Stock Adjustment'}
                </button>
              </FormActions>
            </form>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
