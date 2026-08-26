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

export default function CreatePurchaseReturnPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [purchaseId, setPurchaseId] = useState('');
  const [reason, setReason] = useState('Damaged / Defective');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [returnItems, setReturnItems] = useState<{ purchaseItemId: string; quantity: string }[]>([]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const purchasesQuery = useQuery({
    queryKey: ['purchases-confirmed-list'],
    queryFn: () => api('/purchases?status=CONFIRMED&limit=100'),
  });

  const selectedPurchaseQuery = useQuery({
    queryKey: ['purchase-detail-for-return', purchaseId],
    queryFn: () => api<any>(`/purchases/${purchaseId}`),
    enabled: Boolean(purchaseId),
  });

  const selectedPurchase = selectedPurchaseQuery.data;

  function handlePurchaseChange(id: string) {
    setPurchaseId(id);
    setReturnItems([]);
  }

  function setItemQty(purchaseItemId: string, qty: string) {
    setReturnItems((rows) => {
      const existing = rows.find((r) => r.purchaseItemId === purchaseItemId);
      if (existing) {
        return rows.map((r) => (r.purchaseItemId === purchaseItemId ? { ...r, quantity: qty } : r));
      } else {
        return [...rows, { purchaseItemId, quantity: qty }];
      }
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!purchaseId) {
      setError(t('documents.supplier_invoice_ref'));
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
      await api('/purchases/returns', {
        method: 'POST',
        body: JSON.stringify({
          purchaseId,
          reason,
          note: note || undefined,
          date: new Date(date).toISOString(),
          items: validItems.map((i) => ({
            purchaseItemId: i.purchaseItemId,
            quantity: Number(i.quantity),
          })),
        }),
      });

      router.push('/dashboard/purchases/returns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record purchase return.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('purchases.record_return')}
            description={t('purchases.returns_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('purchases.title'), href: '/dashboard/purchases' },
              { label: t('purchases.returns_title'), href: '/dashboard/purchases/returns' },
              { label: t('common.create') },
            ]}
          />

          {purchasesQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : (
            <form className="record-form" onSubmit={submit}>
              <FormSection title={t('purchases.returns_title')}>
                <div className="form-grid">
                  <FormField label={t('purchases.purchase_number')} required>
                    <select
                      required
                      value={purchaseId}
                      onChange={(e) => handlePurchaseChange(e.target.value)}
                    >
                      <option value="">{t('purchases.purchase_number')}</option>
                      {extractItems<any>(purchasesQuery.data).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.purchaseNumber} — {p.supplier?.name} ({t('common.total')}: {money(p.grandTotal)})
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label={t('inventory.reason')} required>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="Damaged / Defective">Damaged / Defective</option>
                      <option value="Quality Discrepancy">Quality Discrepancy</option>
                      <option value="Incorrect Specification">Incorrect Specification</option>
                      <option value="Over-shipment Return">Over-shipment Return</option>
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

              {selectedPurchase && (
                <FormSection title={t('documents.line_items')}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {selectedPurchase.items.map((item: any) => {
                      const itemState = returnItems.find((r) => r.purchaseItemId === item.id);
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
                              {t('documents.qty')}: <strong>{item.quantity} {item.product?.unit || 'pcs'}</strong> · {t('documents.unit_cost')}: <strong>{money(item.unitCost)}</strong>
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
                <button className="primary-button" disabled={saving || !purchaseId}>
                  {saving ? t('common.processing') : t('purchases.record_return')}
                </button>
              </FormActions>
            </form>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
