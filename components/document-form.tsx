'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, extractItems, money } from '../lib/api';
import { FormActions, FormField, FormSection, LoadingSpinner } from './ui';
import { Trash2, Plus, AlertCircle, UserPlus, Building2 } from 'lucide-react';
import { useTranslation } from '../provider';

type Mode = 'sale' | 'purchase';

interface LineItemState {
  productId: string;
  quantity: string;
  price: string;
  discount: string;
  tax: string;
}

export function DocumentForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const isSale = mode === 'sale';

  const [partyId, setPartyId] = useState('');
  const [isNewParty, setIsNewParty] = useState(false);

  // Inline new party details
  const [newParty, setNewParty] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
  });

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [status, setStatus] = useState<'CONFIRMED' | 'DRAFT'>('CONFIRMED');
  const [paid, setPaid] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [shipping, setShipping] = useState('0');
  const [method, setMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItemState[]>([
    { productId: '', quantity: '1', price: '', discount: '0', tax: '0' },
  ]);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const productsQuery = useQuery({
    queryKey: ['document-products-list'],
    queryFn: () => api('/products?limit=200'),
  });

  const partiesQuery = useQuery({
    queryKey: [mode + '-parties-list'],
    queryFn: () => api(isSale ? '/customers?limit=100' : '/suppliers?limit=100'),
  });

  const products = extractItems<any>(productsQuery.data);
  const parties = extractItems<any>(partiesQuery.data);

  // Real-time calculations
  const itemsSubtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const q = Number(item.quantity || 0);
      const p = Number(item.price || 0);
      const d = Number(item.discount || 0);
      const t = Number(item.tax || 0);
      return acc + (q * p - d + t);
    }, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    const d = Number(discount || 0);
    const t = Number(tax || 0);
    const s = Number(shipping || 0);
    return Math.max(0, itemsSubtotal - d + t + s);
  }, [itemsSubtotal, discount, tax, shipping]);

  const dueAmount = useMemo(() => {
    const p = Number(paid || 0);
    return Math.max(0, grandTotal - p);
  }, [grandTotal, paid]);

  const addLine = () => {
    setItems((rows) => [...rows, { productId: '', quantity: '1', price: '', discount: '0', tax: '0' }]);
  };

  const removeLine = (index: number) => {
    setItems((rows) => rows.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, key: keyof LineItemState, value: string) => {
    setItems((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [key]: value };

        // Auto-populate default price on product selection
        if (key === 'productId') {
          const prod = products.find((p) => p.id === value);
          if (prod) {
            updated.price = String(isSale ? prod.sellingPrice : prod.purchasePrice);
          }
        }
        return updated;
      })
    );
  };

  const handlePartySelectChange = (val: string) => {
    if (val === '__NEW__') {
      setIsNewParty(true);
      setPartyId('');
    } else {
      setIsNewParty(false);
      setPartyId(val);
    }
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Form Level Validation
    if (!isSale && !partyId && (!isNewParty || !newParty.name.trim())) {
      setError(t('documents.select_supplier'));
      return;
    }

    if (items.some((i) => !i.productId || Number(i.quantity) <= 0 || Number(i.price) < 0)) {
      setError(t('documents.select_product'));
      return;
    }

    setSaving(true);

    try {
      let resolvedPartyId = partyId;

      // 1. If registering a new party inline, create them first!
      if (isNewParty && newParty.name.trim()) {
        if (isSale) {
          const createdCustomer = await api<any>('/customers', {
            method: 'POST',
            body: JSON.stringify({
              name: newParty.name.trim(),
              phone: newParty.phone.trim() || undefined,
              email: newParty.email.trim() || undefined,
              address: newParty.address.trim() || undefined,
              status: 'ACTIVE',
            }),
          });
          resolvedPartyId = createdCustomer.id;
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        } else {
          const createdSupplier = await api<any>('/suppliers', {
            method: 'POST',
            body: JSON.stringify({
              name: newParty.name.trim(),
              company: newParty.company.trim() || undefined,
              phone: newParty.phone.trim() || undefined,
              email: newParty.email.trim() || undefined,
              address: newParty.address.trim() || undefined,
              status: 'ACTIVE',
            }),
          });
          resolvedPartyId = createdSupplier.id;
          queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        }
      }

      // 2. Submit sale or purchase document
      const payload: Record<string, any> = {
        ...(invoiceNumber.trim() ? (isSale ? { invoiceNumber: invoiceNumber.trim() } : { invoiceNumber: invoiceNumber.trim() }) : {}),
        ...(isSale
          ? { customerId: resolvedPartyId || undefined, saleDate: new Date(date).toISOString() }
          : { supplierId: resolvedPartyId, purchaseDate: new Date(date).toISOString() }),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          ...(isSale ? { unitPrice: Number(i.price) } : { unitCost: Number(i.price) }),
          discount: Number(i.discount || 0),
          tax: Number(i.tax || 0),
        })),
        discount: Number(discount || 0),
        tax: Number(tax || 0),
        shipping: Number(shipping || 0),
        paidAmount: Number(paid || 0),
        paymentMethod: method,
        notes: notes.trim() || undefined,
        status,
      };

      const endpoint = isSale ? '/sales' : '/purchases';
      await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push(`/dashboard/${isSale ? 'sales' : 'purchases'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process transaction.');
    } finally {
      setSaving(false);
    }
  }

  if (productsQuery.isLoading || partiesQuery.isLoading) {
    return <LoadingSpinner label={t('common.loading')} />;
  }

  return (
    <form className="record-form" onSubmit={submit}>
      <FormSection title={isSale ? t('documents.sale_details') : t('documents.purchase_details')}>
        <div className="form-grid">
          {/* Party Selection Field with Quick New Registration Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#50586d' }}>
                {isSale ? t('documents.customer') : t('documents.supplier')} {!isSale && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <button
                type="button"
                onClick={() => setIsNewParty((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isNewParty ? '#ef4444' : '#4f46e5',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isNewParty ? (
                  t('documents.select_existing')
                ) : (
                  <>
                    <UserPlus size={13} /> {isSale ? t('documents.new_customer_btn') : t('documents.new_supplier_btn')}
                  </>
                )}
              </button>
            </div>

            {!isNewParty ? (
              <select
                value={partyId}
                required={!isSale}
                onChange={(e) => handlePartySelectChange(e.target.value)}
                style={{
                  border: '1px solid #dfe4ef',
                  borderRadius: 7,
                  padding: 10,
                  background: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value="">{isSale ? t('documents.walk_in_customer') : t('documents.select_supplier')}</option>
                <option value="__NEW__" style={{ color: '#4f46e5', fontWeight: 600 }}>
                  {isSale ? t('documents.register_new_customer') : t('documents.register_new_supplier')}
                </option>
                {parties.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.company ? `(${p.company})` : ''} {p.phone ? `· ${p.phone}` : ''} {p.balance ? `· Due: ${money(p.balance)}` : ''}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <FormField label={isSale ? t('documents.invoice_reference') : t('documents.supplier_invoice_ref')}>
            <input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder={isSale ? 'Auto-generated invoice number' : 'e.g. BILL-9902'}
            />
          </FormField>

          <FormField label={t('documents.document_date')} required>
            <input
              required
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>

          <FormField label={t('documents.document_status')} required>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="CONFIRMED">{t('documents.confirmed_desc')}</option>
              <option value="DRAFT">{t('documents.draft_desc')}</option>
            </select>
          </FormField>
        </div>

        {/* First-Time Customer / Supplier Registration Box */}
        {isNewParty && (
          <div
            style={{
              marginTop: 18,
              padding: '18px 20px',
              background: '#f8fafc',
              border: '1.5px dashed #6366f1',
              borderRadius: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              {isSale ? <UserPlus size={18} color="#4f46e5" /> : <Building2 size={18} color="#4f46e5" />}
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                {isSale ? t('documents.new_customer_registration') : t('documents.new_supplier_registration')}
              </span>
            </div>

            <div className="form-grid">
              <FormField label={isSale ? t('customers.customer_name') : t('suppliers.supplier_name')} required>
                <input
                  required
                  value={newParty.name}
                  onChange={(e) => setNewParty((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={isSale ? 'e.g. Mohammad Rahim' : 'e.g. Metro Wholesale Distributors'}
                />
              </FormField>

              {!isSale && (
                <FormField label={t('suppliers.company_name')}>
                  <input
                    value={newParty.company}
                    onChange={(e) => setNewParty((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Metro Trading Ltd."
                  />
                </FormField>
              )}

              <FormField label={t('common.phone')}>
                <input
                  type="tel"
                  value={newParty.phone}
                  onChange={(e) => setNewParty((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +880 1700-000000"
                />
              </FormField>

              <FormField label={t('common.email')}>
                <input
                  type="email"
                  value={newParty.email}
                  onChange={(e) => setNewParty((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. contact@example.com"
                />
              </FormField>

              <FormField label={t('common.address')}>
                <input
                  value={newParty.address}
                  onChange={(e) => setNewParty((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address, city, area…"
                />
              </FormField>
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title={t('documents.line_items')}>
        <div className="line-items">
          {items.map((item, i) => {
            const prod = products.find((p) => p.id === item.productId);
            const lineTotal =
              Number(item.quantity || 0) * Number(item.price || 0) -
              Number(item.discount || 0) +
              Number(item.tax || 0);

            return (
              <div
                className="line-item"
                key={i}
                style={{
                  gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 1.2fr auto',
                  alignItems: 'center',
                }}
              >
                <select
                  required
                  value={item.productId}
                  onChange={(e) => updateLine(i, 'productId', e.target.value)}
                >
                  <option value="">{t('documents.select_product')}</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) · In Stock: {p.stock ?? 0} {p.unit || 'pcs'}
                    </option>
                  ))}
                </select>

                <input
                  required
                  min="0.001"
                  step="0.001"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                  placeholder={t('documents.qty')}
                />

                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={item.price}
                  onChange={(e) => updateLine(i, 'price', e.target.value)}
                  placeholder={isSale ? t('documents.unit_price') : t('documents.unit_cost')}
                />

                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={item.discount}
                  onChange={(e) => updateLine(i, 'discount', e.target.value)}
                  placeholder={t('common.discount')}
                />

                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={item.tax}
                  onChange={(e) => updateLine(i, 'tax', e.target.value)}
                  placeholder={t('common.tax')}
                />

                <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', paddingRight: 8 }}>
                  {money(lineTotal)}
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  disabled={items.length === 1}
                  style={{
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#ef4444',
                    padding: 8,
                    cursor: 'pointer',
                    borderRadius: 6,
                  }}
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="add-line"
          onClick={addLine}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, cursor: 'pointer' }}
        >
          <Plus size={15} /> {t('documents.add_another_product')}
        </button>
      </FormSection>

      <FormSection title={t('documents.totals_payment_notes')}>
        <div className="form-grid">
          <FormField label={t('documents.doc_discount')}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </FormField>

          <FormField label={t('documents.tax_amount')}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
            />
          </FormField>

          <FormField label={t('documents.shipping_charge')}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </FormField>

          <FormField label={`${t('common.paid_amount')} (${t('common.bdt')})`}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
          </FormField>

          <FormField label={t('common.payment_method')}>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              {['CASH', 'BANK', 'BKASH', 'NAGAD', 'CARD', 'OTHER'].map((m) => (
                <option key={m} value={m}>
                  {m === 'CASH'
                    ? t('common.cash')
                    : m === 'BANK'
                    ? t('common.bank')
                    : m === 'BKASH'
                    ? t('common.bkash')
                    : m === 'NAGAD'
                    ? t('common.nagad')
                    : m === 'CARD'
                    ? t('common.card')
                    : t('common.other')}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div
          style={{
            margin: '16px 0',
            padding: 16,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#64748b' }}>{t('common.subtotal')}:</span>{' '}
            <strong>{money(itemsSubtotal)}</strong>
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748b' }}>{t('common.grand_total')}:</span>{' '}
            <strong style={{ fontSize: 18, color: '#1e293b' }}>{money(grandTotal)}</strong>
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748b' }}>{t('common.due_amount')}:</span>{' '}
            <strong style={{ fontSize: 18, color: dueAmount > 0 ? '#ef4444' : '#10b981' }}>
              {money(dueAmount)}
            </strong>
          </div>
        </div>

        <FormField label={t('documents.internal_notes')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, delivery instructions, warranty notes…"
          />
        </FormField>
      </FormSection>

      {error && (
        <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <FormActions>
        <button type="button" onClick={() => router.back()}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? t('common.processing') : isSale ? t('documents.save_confirm_sale') : t('documents.save_confirm_purchase')}
        </button>
      </FormActions>
    </form>
  );
}
