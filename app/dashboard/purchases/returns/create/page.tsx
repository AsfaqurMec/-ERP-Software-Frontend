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

export default function CreatePurchaseReturnPage() {
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
      setError('Please select an original purchase order.');
      return;
    }

    const validItems = returnItems.filter((i) => Number(i.quantity) > 0);
    if (!validItems.length) {
      setError('Please specify a return quantity of at least one item.');
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
            title="Record Purchase Return"
            description="Return inventory to supplier, reduce stock levels and adjust supplier account balance."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Purchases', href: '/dashboard/purchases' },
              { label: 'Returns', href: '/dashboard/purchases/returns' },
              { label: 'Create' },
            ]}
          />

          {purchasesQuery.isLoading ? (
            <LoadingSpinner label="Loading purchase orders…" />
          ) : (
            <form className="record-form" onSubmit={submit}>
              <FormSection title="Return Metadata">
                <div className="form-grid">
                  <FormField label="Select Confirmed Purchase Order" required>
                    <select
                      required
                      value={purchaseId}
                      onChange={(e) => handlePurchaseChange(e.target.value)}
                    >
                      <option value="">Choose purchase order</option>
                      {extractItems<any>(purchasesQuery.data).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.purchaseNumber} — {p.supplier?.name} (Total: {money(p.grandTotal)})
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Return Reason" required>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="Damaged / Defective">Damaged / Defective</option>
                      <option value="Quality Discrepancy">Quality Discrepancy</option>
                      <option value="Incorrect Specification">Incorrect Specification</option>
                      <option value="Over-shipment Return">Over-shipment Return</option>
                      <option value="Other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Return Date & Time" required>
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
                <FormSection title="Select Quantities to Return">
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
                              Purchased Quantity: <strong>{item.quantity} {item.product?.unit || 'pcs'}</strong> · Unit Cost: <strong>{money(item.unitCost)}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 12, color: '#475569' }}>Return Qty:</label>
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

              <FormSection title="Internal Notes">
                <FormField label="Notes">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Supplier communication, dispatch tracking…"
                  />
                </FormField>
              </FormSection>

              {error && <div className="form-error">{error}</div>}

              <FormActions>
                <button type="button" onClick={() => router.back()}>
                  Cancel
                </button>
                <button className="primary-button" disabled={saving || !purchaseId}>
                  {saving ? 'Processing…' : 'Confirm Purchase Return'}
                </button>
              </FormActions>
            </form>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
