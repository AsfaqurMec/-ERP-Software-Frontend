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
import { Coins, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../../../provider';

export default function PurchaseDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Pay Due Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 16));
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState('');

  const purchaseQuery = useQuery({
    queryKey: ['purchase-detail', id],
    queryFn: () => api<any>(`/purchases/${id}`),
  });

  async function handleCancel() {
    setCancelling(true);
    try {
      await api(`/purchases/${id}/cancel`, { method: 'POST' });
      setCancelOpen(false);
      purchaseQuery.refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not cancel purchase');
    } finally {
      setCancelling(false);
    }
  }

  async function handleRecordPayment(e: FormEvent) {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      setPayError(t('payments.amount_greater_zero'));
      return;
    }

    setPaySaving(true);
    setPayError('');

    try {
      await api('/payments', {
        method: 'POST',
        body: JSON.stringify({
          partyType: 'SUPPLIER',
          partyId: p.supplier.id,
          purchaseId: p.id,
          amount: Number(payAmount),
          date: new Date(payDate).toISOString(),
          method: payMethod,
          reference: payReference || `Payment for ${p.purchaseNumber}`,
          note: payNote || undefined,
        }),
      });

      setPayModalOpen(false);
      setPayAmount('');
      setPayReference('');
      setPayNote('');
      purchaseQuery.refetch();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Failed to record payment.');
    } finally {
      setPaySaving(false);
    }
  }

  function openPayModal() {
    setPayAmount(String(p?.dueAmount || ''));
    setPayReference(`PO-${p?.purchaseNumber}`);
    setPayError('');
    setPayModalOpen(true);
  }

  if (purchaseQuery.isLoading) {
    return (
      <AuthGuard>
        <Shell>
          <LoadingSpinner label={t('common.loading')} />
        </Shell>
      </AuthGuard>
    );
  }

  if (purchaseQuery.error) {
    return (
      <AuthGuard>
        <Shell>
          <ErrorState message={purchaseQuery.error.message} onRetry={() => purchaseQuery.refetch()} />
        </Shell>
      </AuthGuard>
    );
  }

  const p = purchaseQuery.data;
  const hasDue = Number(p.dueAmount) > 0 && p.status === 'CONFIRMED';

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={`${t('purchases.purchase_number')}: ${p.purchaseNumber}`}
            description={`${t('purchases.supplier')}: ${p.supplier?.name} ${p.supplier?.company ? `(${p.supplier.company})` : ''}`}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('purchases.title'), href: '/dashboard/purchases' },
              { label: p.purchaseNumber },
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
                    <Coins size={16} /> {t('payments.pay_due_title')}
                  </button>
                )}
                {p.status === 'DRAFT' && (
                  <button type="button" className="ghost" style={{ color: '#ef4444' }} onClick={() => setCancelOpen(true)}>
                    {t('common.cancel')}
                  </button>
                )}
                {p.status === 'CONFIRMED' && (
                  <Link className="ghost" href={`/dashboard/inventory/movements`}>
                    {t('inventory.stock_movements')}
                  </Link>
                )}
              </div>
            }
          />

          {/* Details Grid */}
          <div className="detail-grid">
            <section className="card">
              <h3>{t('documents.purchase_details')}</h3>
              <dl>
                <dt>{t('purchases.purchase_number')}</dt>
                <dd>
                  <code>{p.purchaseNumber}</code>
                </dd>

                <dt>{t('purchases.supplier')}</dt>
                <dd>
                  <Link href={`/dashboard/suppliers/${p.supplier.id}`} style={{ color: '#5068e6' }}>
                    {p.supplier.name}
                  </Link>
                </dd>

                <dt>{t('documents.supplier_invoice_ref')}</dt>
                <dd>{p.invoiceNumber || '—'}</dd>

                <dt>{t('common.date')}</dt>
                <dd>
                  <DateDisplay value={p.purchaseDate} />
                </dd>

                <dt>{t('common.status')}</dt>
                <dd>
                  <StatusBadge value={p.status} />
                </dd>

                <dt>{t('purchases.payment_status')}</dt>
                <dd>
                  <PaymentStatusBadge value={p.paymentStatus} />
                </dd>

                <dt>{t('common.payment_method')}</dt>
                <dd>{p.paymentMethod || '—'}</dd>
              </dl>
            </section>

            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{t('reports.period_summary')}</h3>
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
                    + {t('payments.pay_due_title')}
                  </button>
                )}
              </div>
              <dl>
                <dt>{t('common.subtotal')}</dt>
                <dd>
                  <CurrencyDisplay value={p.subtotal} />
                </dd>

                <dt>{t('common.discount')} (-)</dt>
                <dd>
                  <CurrencyDisplay value={p.discount} />
                </dd>

                <dt>{t('common.tax')} (+)</dt>
                <dd>
                  <CurrencyDisplay value={p.tax} />
                </dd>

                <dt>{t('documents.shipping_charge')} (+)</dt>
                <dd>
                  <CurrencyDisplay value={p.shipping} />
                </dd>

                <dt>{t('purchases.grand_total')}</dt>
                <dd>
                  <strong style={{ fontSize: 16 }}>
                    <CurrencyDisplay value={p.grandTotal} />
                  </strong>
                </dd>

                <dt>{t('purchases.paid_amount')}</dt>
                <dd style={{ color: '#188b64', fontWeight: 600 }}>
                  <CurrencyDisplay value={p.paidAmount} />
                </dd>

                <dt>{t('purchases.due_amount')}</dt>
                <dd style={{ color: Number(p.dueAmount) > 0 ? '#ef4444' : '#188b64', fontWeight: 700 }}>
                  <CurrencyDisplay value={p.dueAmount} />
                </dd>
              </dl>
            </section>
          </div>

          {/* Line Items Table */}
          <section className="card">
            <div className="card-head">
              <div>
                <h3>{t('products.title')}</h3>
                <p>{t('documents.line_items')}</p>
              </div>
            </div>
            <DataTable
              columns={[
                t('products.name'),
                t('products.sku'),
                t('documents.qty'),
                t('documents.unit_cost'),
                t('common.discount'),
                t('common.tax'),
                t('common.subtotal'),
                t('common.grand_total'),
              ]}
            >
              {p.items.map((i: any) => (
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
                    <CurrencyDisplay value={i.unitCost} />
                  </td>
                  <td>
                    <CurrencyDisplay value={i.discount} />
                  </td>
                  <td>
                    <CurrencyDisplay value={i.tax} />
                  </td>
                  <td>
                    <CurrencyDisplay value={i.subtotal} />
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
          {p.payments && p.payments.length > 0 && (
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>{t('payments.supplier_disbursements')}</h3>
                  <p>{t('payments.title')}</p>
                </div>
              </div>
              <DataTable
                columns={[
                  t('common.date'),
                  t('common.amount'),
                  t('common.payment_method'),
                  t('activity_logs.reference'),
                  t('common.description'),
                ]}
              >
                {p.payments.map((pm: any) => (
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

          {p.notes && (
            <section className="card">
              <h3>{t('documents.internal_notes')}</h3>
              <p style={{ color: '#555e75', margin: 0 }}>{p.notes}</p>
            </section>
          )}

          {/* Pay Due Modal */}
          {payModalOpen && (
            <div className="dialog-backdrop">
              <div className="dialog" style={{ width: 'min(100%, 500px)' }}>
                <h3>{t('payments.pay_due_title')}</h3>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                  {p.supplier.name} · {p.purchaseNumber}
                </p>

                <form onSubmit={handleRecordPayment} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>{t('purchases.purchase_number')}:</span>
                      <strong>{p.purchaseNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>{t('purchases.supplier')}:</span>
                      <strong>{p.supplier.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>{t('purchases.due_amount')}:</span>
                      <strong style={{ color: '#ef4444', fontSize: 15 }}>
                        <CurrencyDisplay value={p.dueAmount} />
                      </strong>
                    </div>
                  </div>

                  <div className="form-grid">
                    <FormField label={`${t('common.amount')} (${t('common.bdt')})`} required>
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

                    <FormField label={t('common.payment_method')} required>
                      <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
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

                  <div className="form-grid">
                    <FormField label={t('common.date')} required>
                      <input
                        required
                        type="datetime-local"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('activity_logs.reference')}>
                      <input
                        value={payReference}
                        onChange={(e) => setPayReference(e.target.value)}
                        placeholder="e.g. TXN-108422 or Cheque #"
                      />
                    </FormField>
                  </div>

                  <FormField label={t('common.description')}>
                    <textarea
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder={t('common.description')}
                      style={{ minHeight: 60 }}
                    />
                  </FormField>

                  {payError && <div className="form-error">{payError}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setPayModalOpen(false)}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="primary-button" disabled={paySaving}>
                      {paySaving ? t('common.saving') : t('payments.pay_due_title')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Confirm Cancel Dialog */}
          <ConfirmDialog
            open={cancelOpen}
            title={t('common.cancel')}
            danger={true}
            confirmLabel={cancelling ? t('common.loading') : t('status.cancelled')}
            onConfirm={handleCancel}
            onCancel={() => setCancelOpen(false)}
          >
            {t('common.delete_confirm')}
          </ConfirmDialog>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
