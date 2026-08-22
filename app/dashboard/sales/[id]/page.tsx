'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DateDisplay,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  PaymentStatusBadge,
  StatusBadge,
  ConfirmDialog,
  ErrorState,
  FormField,
} from '../../../../components/ui';
import { Coins, Eye } from 'lucide-react';

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Receive Due Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 16));
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState('');

  const saleQuery = useQuery({
    queryKey: ['sale-detail', id],
    queryFn: () => api<any>(`/sales/${id}`),
  });

  async function handleCancel() {
    setCancelling(true);
    try {
      await api(`/sales/${id}/cancel`, { method: 'POST' });
      setCancelOpen(false);
      saleQuery.refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not cancel sale');
    } finally {
      setCancelling(false);
    }
  }

  async function handleReceivePayment(e: FormEvent) {
    e.preventDefault();
    if (!s.customer) {
      setPayError('Cannot record payment for walk-in customer without registered profile.');
      return;
    }
    if (!payAmount || Number(payAmount) <= 0) {
      setPayError('Payment amount must be greater than zero.');
      return;
    }

    setPaySaving(true);
    setPayError('');

    try {
      await api('/payments', {
        method: 'POST',
        body: JSON.stringify({
          partyType: 'CUSTOMER',
          partyId: s.customer.id,
          saleId: s.id,
          amount: Number(payAmount),
          date: new Date(payDate).toISOString(),
          method: payMethod,
          reference: payReference || `Collection for ${s.invoiceNumber}`,
          note: payNote || undefined,
        }),
      });

      setPayModalOpen(false);
      setPayAmount('');
      setPayReference('');
      setPayNote('');
      saleQuery.refetch();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Failed to record payment receipt.');
    } finally {
      setPaySaving(false);
    }
  }

  function openPayModal() {
    setPayAmount(String(s?.dueAmount || ''));
    setPayReference(`INV-${s?.invoiceNumber}`);
    setPayError('');
    setPayModalOpen(true);
  }

  if (saleQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label="Loading sales invoice details…" />
        </Shell>
      </AuthGuard>
    );
  }

  if (saleQuery.error) {
    return (
      <AuthGuard>
        <Shell>
          <ErrorState message={saleQuery.error.message} onRetry={() => saleQuery.refetch()} />
        </Shell>
      </AuthGuard>
    );
  }

  const s = saleQuery.data;
  const grossProfit = Number(s.grandTotal) - Number(s.cogs);
  const hasDue = Number(s.dueAmount) > 0 && s.status === 'CONFIRMED' && s.customer;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={`Invoice: ${s.invoiceNumber}`}
            description={`Customer: ${s.customer ? s.customer.name : 'Walk-in Customer'}`}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Sales', href: '/dashboard/sales' },
              { label: s.invoiceNumber },
            ]}
            action={
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {hasDue && (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={openPayModal}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Coins size={16} /> Receive Due
                  </button>
                )}
                <Link className="primary-button" href={`/dashboard/invoices/${id}`}>
                  Print / View Invoice
                </Link>
                {s.status === 'DRAFT' && (
                  <button type="button" className="ghost" style={{ color: '#ef4444' }} onClick={() => setCancelOpen(true)}>
                    Cancel Draft
                  </button>
                )}
                {s.status === 'CONFIRMED' && (
                  <Link className="ghost" href={`/dashboard/inventory/movements`}>
                    View Dispatch Logs
                  </Link>
                )}
              </div>
            }
          />

          {/* Details Grid */}
          <div className="detail-grid">
            <section className="card">
              <h3>Invoice Information</h3>
              <dl>
                <dt>Invoice Number</dt>
                <dd>
                  <code>{s.invoiceNumber}</code>
                </dd>

                <dt>Customer Name</dt>
                <dd>
                  {s.customer ? (
                    <Link href={`/dashboard/customers/${s.customer.id}`} style={{ color: '#5068e6' }}>
                      {s.customer.name}
                    </Link>
                  ) : (
                    'Walk-in Customer'
                  )}
                </dd>

                <dt>Sale Date</dt>
                <dd>
                  <DateDisplay value={s.saleDate} />
                </dd>

                <dt>Document Status</dt>
                <dd>
                  <StatusBadge value={s.status} />
                </dd>

                <dt>Payment Status</dt>
                <dd>
                  <PaymentStatusBadge value={s.paymentStatus} />
                </dd>

                <dt>Payment Method</dt>
                <dd>{s.paymentMethod || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Financial Breakdown</h3>
                {hasDue && (
                  <button
                    type="button"
                    onClick={openPayModal}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#4f46e5',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    + Receive Due
                  </button>
                )}
              </div>
              <dl>
                <dt>Items Subtotal</dt>
                <dd>
                  <CurrencyDisplay value={s.subtotal} />
                </dd>

                <dt>Discount (-)</dt>
                <dd>
                  <CurrencyDisplay value={s.discount} />
                </dd>

                <dt>Tax (+)</dt>
                <dd>
                  <CurrencyDisplay value={s.tax} />
                </dd>

                <dt>Shipping (+)</dt>
                <dd>
                  <CurrencyDisplay value={s.shipping} />
                </dd>

                <dt>Grand Total Revenue</dt>
                <dd>
                  <strong style={{ fontSize: 16 }}>
                    <CurrencyDisplay value={s.grandTotal} />
                  </strong>
                </dd>

                <dt>Cost of Goods Sold (COGS)</dt>
                <dd style={{ color: '#71798d' }}>
                  <CurrencyDisplay value={s.cogs} />
                </dd>

                <dt>Gross Margin</dt>
                <dd style={{ color: grossProfit >= 0 ? '#188b64' : '#bd5664', fontWeight: 700 }}>
                  <CurrencyDisplay value={grossProfit} />
                </dd>

                <dt>Paid Amount</dt>
                <dd style={{ color: '#188b64', fontWeight: 600 }}>
                  <CurrencyDisplay value={s.paidAmount} />
                </dd>

                <dt>Outstanding Due</dt>
                <dd style={{ color: Number(s.dueAmount) > 0 ? '#ef4444' : '#188b64', fontWeight: 700 }}>
                  <CurrencyDisplay value={s.dueAmount} />
                </dd>
              </dl>
            </section>
          </div>

          {/* Sold Items Table */}
          <section className="card">
            <div className="card-head">
              <div>
                <h3>Sold Products</h3>
                <p>Line items with unit cost and margins</p>
              </div>
            </div>
            <DataTable columns={['Product', 'SKU', 'Quantity', 'Unit Price', 'Unit Cost (COGS)', 'Discount', 'Tax', 'Total']}>
              {s.items.map((i: any) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.product?.name}</strong>
                  </td>
                  <td>
                    <code>{i.product?.sku}</code>
                  </td>
                  <td>
                    <strong>
                      {i.quantity} {i.product?.unit || 'pcs'}
                    </strong>
                  </td>
                  <td>
                    <CurrencyDisplay value={i.unitPrice} />
                  </td>
                  <td>
                    <span style={{ color: '#71798d' }}>
                      <CurrencyDisplay value={i.unitCost} />
                    </span>
                  </td>
                  <td>
                    <CurrencyDisplay value={i.discount} />
                  </td>
                  <td>
                    <CurrencyDisplay value={i.tax} />
                  </td>
                  <td>
                    <strong>
                      <CurrencyDisplay value={i.total} />
                    </strong>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>

          {/* Payment Receipts History */}
          {s.payments && s.payments.length > 0 && (
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>Customer Payment Receipts</h3>
                  <p>Payments received against this sale</p>
                </div>
              </div>
              <DataTable columns={['Date', 'Amount', 'Payment Method', 'Reference', 'Notes']}>
                {s.payments.map((pm: any) => (
                  <tr key={pm.id}>
                    <td>
                      <DateDisplay value={pm.date} />
                    </td>
                    <td>
                      <strong>
                        <CurrencyDisplay value={pm.amount} />
                      </strong>
                    </td>
                    <td>
                      <StatusBadge value={pm.method} />
                    </td>
                    <td>{pm.reference || '—'}</td>
                    <td>{pm.note || '—'}</td>
                  </tr>
                ))}
              </DataTable>
            </section>
          )}

          {s.notes && (
            <section className="card">
              <h3>Invoice Notes</h3>
              <p style={{ color: '#555e75', margin: 0 }}>{s.notes}</p>
            </section>
          )}

          {/* Receive Customer Due Modal */}
          {payModalOpen && (
            <div className="dialog-backdrop">
              <div className="dialog" style={{ width: 'min(100%, 500px)' }}>
                <h3>Receive Customer Due Payment</h3>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                  Collect outstanding balance from <strong>{s.customer?.name}</strong> for Invoice #{s.invoiceNumber}.
                </p>

                <form onSubmit={handleReceivePayment} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Invoice Number:</span>
                      <strong>{s.invoiceNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Customer:</span>
                      <strong>{s.customer?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Current Outstanding Due:</span>
                      <strong style={{ color: '#ef4444', fontSize: 15 }}>
                        <CurrencyDisplay value={s.dueAmount} />
                      </strong>
                    </div>
                  </div>

                  <div className="form-grid">
                    <FormField label="Amount Received (BDT)" required>
                      <input
                        required
                        min="0.01"
                        step="0.01"
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </FormField>

                    <FormField label="Payment Method" required>
                      <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                        {['CASH', 'BANK', 'BKASH', 'NAGAD', 'CARD', 'OTHER'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="form-grid">
                    <FormField label="Collection Date & Time" required>
                      <input
                        required
                        type="datetime-local"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Transaction / Cheque Reference">
                      <input
                        value={payReference}
                        onChange={(e) => setPayReference(e.target.value)}
                        placeholder="e.g. Trx-998822 or Cheque #"
                      />
                    </FormField>
                  </div>

                  <FormField label="Notes">
                    <textarea
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="Optional notes or remarks…"
                      style={{ minHeight: 60 }}
                    />
                  </FormField>

                  {payError && <div className="form-error">{payError}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setPayModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={paySaving}>
                      {paySaving ? 'Recording…' : 'Confirm Collection'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Confirm Cancel Dialog */}
          <ConfirmDialog
            open={cancelOpen}
            title="Cancel Draft Sale"
            danger={true}
            confirmLabel={cancelling ? 'Cancelling…' : 'Yes, Cancel Invoice'}
            onConfirm={handleCancel}
            onCancel={() => setCancelOpen(false)}
          >
            Are you sure you want to cancel this draft sales invoice? This action cannot be undone.
          </ConfirmDialog>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
