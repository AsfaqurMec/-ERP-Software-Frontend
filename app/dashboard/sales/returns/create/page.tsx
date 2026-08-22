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

export default function CreateSalesReturnPage() {
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
      setError('Please select an original sale invoice.');
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
            title="Record Sales Return"
            description="Restock returned inventory, reduce sales revenue and credit customer balances."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Sales', href: '/dashboard/sales' },
              { label: 'Returns', href: '/dashboard/sales/returns' },
              { label: 'Create' },
            ]}
          />

          {salesQuery.isLoading ? (
            <LoadingSpinner label="Loading sales orders…" />
          ) : (
            <form className="record-form" onSubmit={submit}>
              <FormSection title="Return Metadata">
                <div className="form-grid">
                  <FormField label="Select Confirmed Sales Invoice" required>
                    <select
                      required
                      value={saleId}
                      onChange={(e) => handleSaleChange(e.target.value)}
                    >
                      <option value="">Choose sales invoice</option>
                      {extractItems<any>(salesQuery.data).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.invoiceNumber} — {s.customer ? s.customer.name : 'Walk-in'} (Total: {money(s.grandTotal)})
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Return Reason" required>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="Customer Return">Customer Return</option>
                      <option value="Defective / Damaged">Defective / Damaged</option>
                      <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                      <option value="Order Cancelled Post-Dispatch">Order Cancelled Post-Dispatch</option>
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

              {selectedSale && (
                <FormSection title="Select Quantities to Return">
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
                              Sold Quantity: <strong>{item.quantity} {item.product?.unit || 'pcs'}</strong> · Unit Price: <strong>{money(item.unitPrice)}</strong>
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
                    placeholder="Inspection remarks, restocking condition…"
                  />
                </FormField>
              </FormSection>

              {error && <div className="form-error">{error}</div>}

              <FormActions>
                <button type="button" onClick={() => router.back()}>
                  Cancel
                </button>
                <button className="primary-button" disabled={saving || !saleId}>
                  {saving ? 'Processing…' : 'Confirm Sales Return'}
                </button>
              </FormActions>
            </form>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
