'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { api, extractItems, money } from '../../../../../lib/api';
import {
  FormActions,
  FormField,
  FormSection,
  LoadingSpinner,
  PageContainer,
  PageHeader,
} from '../../../../../components/ui';
import { useTranslation } from '../../../../../provider';

export default function CreateSalesReturnPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [saleId, setSaleId] = useState('');
  const [reason, setReason] = useState('Customer Return');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [returnItems, setReturnItems] = useState<{ saleItemId: string; quantity: string }[]>([]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const salesQuery = useQuery({
    queryKey: ['sales-confirmed-list'],
    queryFn: () => api('/sales?status=CONFIRMED&limit=100'),
  });

  const selectedSaleQuery = useQuery({
    queryKey: ['sale-detail-for-return', saleId],
    queryFn: () => api<any>(`/sales/${saleId}`),
    enabled: Boolean(saleId),
  });

  const selectedSale = selectedSaleQuery.data;

  function handleSaleChange(id: string) {
    setSaleId(id);
    setReturnItems([]);
  }

  function setItemQty(saleItemId: string, qty: string) {
    setReturnItems((rows) => {
      const existing = rows.find((r) => r.saleItemId === saleItemId);
      if (existing) {
        return rows.map((r) => (r.saleItemId === saleItemId ? { ...r, quantity: qty } : r));
      } else {
        return [...rows, { saleItemId, quantity: qty }];
      }
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!saleId) {
      setError(t('documents.invoice_reference'));
      return;
    }

    const validItems = returnItems.filter((i) => Number(i.quantity) > 0);
    if (!validItems.length) {
      setError(t('documents.select_product'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api('/sales/returns', {
        method: 'POST',
        body: JSON.stringify({
          saleId,
          reason,
          note: note || undefined,
          date: new Date(date).toISOString(),
          items: validItems.map((i) => ({
            saleItemId: i.saleItemId,
            quantity: Number(i.quantity),
          })),
        }),
      });

      router.push('/dashboard/sales/returns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sales return.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('sales.record_return')}
            description={t('sales.returns_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('sales.title'), href: '/dashboard/sales' },
              { label: t('sales.returns_title'), href: '/dashboard/sales/returns' },
              { label: t('common.create') },
            ]}
          />

          {salesQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : (
            <form className="record-form" onSubmit={submit}>
              <FormSection title={t('sales.returns_title')}>
                <div className="form-grid">
                  <FormField label={t('sales.invoice_number')} required>
                    <select
                      required
                      value={saleId}
                      onChange={(e) => handleSaleChange(e.target.value)}
                    >
                      <option value="">{t('documents.invoice_reference')}</option>
                      {extractItems<any>(salesQuery.data).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.invoiceNumber} — {s.customer ? s.customer.name : t('common.walk_in_customer')} ({t('common.total')}: {money(s.grandTotal)})
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label={t('inventory.reason')} required>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="Customer Return">Customer Return</option>
                      <option value="Defective / Damaged">Defective / Damaged</option>
                      <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                      <option value="Order Cancelled Post-Dispatch">Order Cancelled Post-Dispatch</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>

                  <FormField label={t('common.date')} required>
                    <input
                      required
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </FormField>
                </div>
              </FormSection>

              {selectedSale && (
                <FormSection title={t('documents.line_items')}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {selectedSale.items.map((item: any) => {
                      const itemState = returnItems.find((r) => r.saleItemId === item.id);
                      const currentVal = itemState ? itemState.quantity : '';

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 12,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                          }}
                        >
                          <div>
                            <strong>{item.product?.name}</strong> (SKU: {item.product?.sku})
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              {t('documents.qty')}: <strong>{item.quantity} {item.product?.unit || 'pcs'}</strong> · {t('documents.unit_price')}: <strong>{money(item.unitPrice)}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 12, color: '#475569' }}>{t('documents.qty')}:</label>
                            <input
                              type="number"
                              min="0"
                              max={item.quantity}
                              step="0.001"
                              value={currentVal}
                              onChange={(e) => setItemQty(item.id, e.target.value)}
                              placeholder="0"
                              style={{ width: 90, padding: 6 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </FormSection>
              )}

              <FormSection title={t('documents.internal_notes')}>
                <FormField label={t('documents.internal_notes')}>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('documents.internal_notes')}
                  />
                </FormField>
              </FormSection>

              {error && <div className="form-error">{error}</div>}

              <FormActions>
                <button type="button" onClick={() => router.back()}>
                  {t('common.cancel')}
                </button>
                <button className="primary-button" disabled={saving || !saleId}>
                  {saving ? t('common.processing') : t('sales.record_return')}
                </button>
              </FormActions>
            </form>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
