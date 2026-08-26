'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api, extractItems } from '../../../../lib/api';
import { useTranslation } from '../../../../provider';
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
  const { t } = useTranslation();

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
      setError(t('inventory.select_product'));
      return;
    }
    if (!data.quantity || Number(data.quantity) <= 0) {
      setError(t('inventory.quantity'));
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
      setError(err instanceof Error ? err.message : t('inventory.adjustment_failed'));
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
            title={t('inventory.stock_adjustment')}
            description={t('inventory.stock_adjustment_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('inventory.stock_position'), href: '/dashboard/inventory' },
              { label: t('inventory.stock_adjustment') },
            ]}
          />

          {productsQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : (
            <form className="record-form" onSubmit={submit}>
              <FormSection title={t('inventory.adjustment_specs')}>
                <div className="form-grid">
                  <FormField label={t('inventory.select_product')} required>
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
                      <option value="">{t('inventory.select_product')}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — {t('inventory.current_stock')}: {p.stock} {p.unit}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label={t('inventory.direction')} required>
                    <select value={data.type} onChange={(e) => set('type', e.target.value)}>
                      <option value="IN">{t('inventory.stock_in')}</option>
                      <option value="OUT">{t('inventory.stock_out')}</option>
                    </select>
                  </FormField>

                  <FormField label={t('inventory.quantity')} required>
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
                    <FormField label={t('inventory.unit_cost')}>
                      <input
                        min="0"
                        step="0.01"
                        type="number"
                        value={data.unitCost}
                        onChange={(e) => set('unitCost', e.target.value)}
                        placeholder="0.00"
                      />
                    </FormField>
                  )}

                  <FormField label={t('inventory.reason')} required>
                    <select value={data.reason} onChange={(e) => set('reason', e.target.value)}>
                      <option value="Damage">{t('inventory.reason_damage')}</option>
                      <option value="Lost">{t('inventory.reason_loss')}</option>
                      <option value="Correction">{t('inventory.reason_correction')}</option>
                      <option value="Opening Stock">{t('inventory.reason_opening')}</option>
                      <option value="Manual Correction">{t('inventory.manual_correction')}</option>
                      <option value="Other">{t('inventory.reason_other')}</option>
                    </select>
                  </FormField>

                  <FormField label={t('common.date_time')} required>
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
                    <strong>{t('inventory.product')}:</strong> {selectedProduct.name} (SKU: {selectedProduct.sku}) ·{' '}
                    <span>{t('inventory.current_stock')}: <strong>{selectedProduct.stock} {selectedProduct.unit}</strong></span> ·{' '}
                    <span>{t('products.purchase_price')}: <strong>{selectedProduct.averageCost || selectedProduct.purchasePrice}</strong></span>
                  </div>
                )}

                <FormField label={t('inventory.note_optional')}>
                  <textarea
                    value={data.note}
                    onChange={(e) => set('note', e.target.value)}
                    placeholder={t('common.notes')}
                  />
                </FormField>
              </FormSection>

              {error && <div className="form-error">{error}</div>}

              <FormActions>
                <button type="button" onClick={() => router.back()}>
                  {t('common.cancel')}
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? t('common.processing') : t('inventory.adjust_stock_btn')}
                </button>
              </FormActions>
            </form>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
