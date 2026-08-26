'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { api } from '../../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DateDisplay,
  EmptyTableState,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  PaymentStatusBadge,
  SearchInput,
  StatCard,
  StatCardGrid,
  FormField,
} from '../../../../components/ui';
import { Coins, ArrowUpRight, PackagePlus, Eye } from 'lucide-react';
import { useTranslation } from '../../../../provider';

export default function PurchaseDuePage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  // Pay Due Modal State
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 16));
  const [payReference, setPayReference] = useState('');
  const [payNote, setPayNote] = useState('');
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState('');

  const queryParams = new URLSearchParams({
    hasDue: 'true',
    page: String(page),
    limit: String(limit),
    sortBy: 'dueAmount',
    sortOrder: 'desc',
    ...(search ? { search } : {}),
  });

  const duePurchasesQuery = useQuery({
    queryKey: ['purchase-due-orders', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/purchases?${queryParams}`),
  });

  const overviewQuery = useQuery({
    queryKey: ['payments-overview-stat'],
    queryFn: () => api<any>('/payments/overview'),
  });

  const ov = overviewQuery.data;

  function openPayDueModal(purchase: any) {
    setSelectedPurchase(purchase);
    setPayAmount(String(purchase.dueAmount || ''));
    setPayReference(`PO-${purchase.purchaseNumber}`);
    setPayDate(new Date().toISOString().slice(0, 16));
    setPayNote('');
    setPayError('');
  }

  async function handlePayDue(e: FormEvent) {
    e.preventDefault();
    if (!selectedPurchase || !selectedPurchase.supplier) {
      setPayError(t('common.error'));
      return;
    }
    if (!payAmount || Number(payAmount) <= 0) {
      setPayError(t('payments.amount'));
      return;
    }

    setPaySaving(true);
    setPayError('');

    try {
      await api('/payments', {
        method: 'POST',
        body: JSON.stringify({
          partyType: 'SUPPLIER',
          partyId: selectedPurchase.supplier.id,
          purchaseId: selectedPurchase.id,
          amount: Number(payAmount),
          date: new Date(payDate).toISOString(),
          method: payMethod,
          reference: payReference || `Disbursement for ${selectedPurchase.purchaseNumber}`,
          note: payNote || undefined,
        }),
      });

      setSelectedPurchase(null);
      setPayAmount('');
      setPayReference('');
      setPayNote('');
      duePurchasesQuery.refetch();
      overviewQuery.refetch();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setPaySaving(false);
    }
  }

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('dues.supplier_due_title')}
            description={t('dues.supplier_due_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('payments.title'), href: '/dashboard/payments' },
              { label: t('dues.supplier_due_title') },
            ]}
          />

          {ov && (
            <StatCardGrid columns={3}>
              <StatCard
                label={t('dues.total_payable')}
                value={<CurrencyDisplay value={ov.totalPayable} />}
                detail={t('dashboard.payables_to_suppliers')}
                icon={<Coins color="#ef4444" size={20} />}
                kind="rose"
              />
              <StatCard
                label={t('payments.disbursed_today')}
                value={<CurrencyDisplay value={ov.paidToday} />}
                detail={t('payments.supplier_disbursements')}
                icon={<ArrowUpRight color="#d28d2b" size={20} />}
                kind="amber"
              />
              <StatCard
                label={t('dues.due_orders_count')}
                value={String(duePurchasesQuery.data?.meta.total ?? '—')}
                detail={t('purchases.title')}
                icon={<PackagePlus color="#6366f1" size={20} />}
                kind="blue"
              />
            </StatCardGrid>
          )}

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder={t('purchases.search_placeholder')}
            />
          </DataTableToolbar>

          {duePurchasesQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : duePurchasesQuery.error ? (
            <div className="error">{duePurchasesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('purchases.purchase_number'),
                  t('common.date'),
                  t('purchases.supplier'),
                  t('purchases.grand_total'),
                  t('purchases.paid_amount'),
                  t('purchases.due_amount'),
                  t('purchases.payment_status'),
                  t('common.actions'),
                ]}
              >
                {duePurchasesQuery.data?.data.length ? (
                  duePurchasesQuery.data.data.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/dashboard/purchases/${p.id}`} style={{ fontWeight: 700, color: '#4f46e5' }}>
                          <code>{p.purchaseNumber}</code>
                        </Link>
                        {p.invoiceNumber && (
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                            Ref: {p.invoiceNumber}
                          </small>
                        )}
                      </td>
                      <td>
                        <DateDisplay value={p.purchaseDate} />
                      </td>
                      <td>
                        {p.supplier ? (
                          <div>
                            <Link href={`/dashboard/suppliers/${p.supplier.id}`} style={{ fontWeight: 700, color: '#1e293b' }}>
                              {p.supplier.name}
                            </Link>
                            {p.supplier.company && (
                              <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                                {p.supplier.company}
                              </small>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>
                      <td>
                        <strong>
                          <CurrencyDisplay value={p.grandTotal} />
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: '#188b64', fontWeight: 600 }}>
                          <CurrencyDisplay value={p.paidAmount} />
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#ef4444', fontSize: 14 }}>
                          <CurrencyDisplay value={p.dueAmount} />
                        </strong>
                      </td>
                      <td>
                        <PaymentStatusBadge value={p.paymentStatus} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.supplier && (
                            <button
                              type="button"
                              onClick={() => openPayDueModal(p)}
                              className="primary-button"
                              style={{
                                padding: '6px 10px',
                                fontSize: 12,
                                gap: 4,
                              }}
                              title={t('dues.pay_due')}
                            >
                              <Coins size={14} /> {t('dues.pay_due')}
                            </button>
                          )}
                          <Link
                            href={`/dashboard/purchases/${p.id}`}
                            className="ghost"
                            style={{
                              padding: '6px 9px',
                              fontSize: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              textDecoration: 'none',
                            }}
                            title={t('common.view')}
                          >
                            <Eye size={14} /> {t('common.view')}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <EmptyTableState message={t('dues.no_due_records')} />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={duePurchasesQuery.data?.meta.total || 0}
                limit={limit}
                onPage={setPage}
                onLimitChange={setLimit}
              />
            </>
          )}

          {/* Pay Due Modal */}
          {selectedPurchase && (
            <div className="dialog-backdrop">
              <div className="dialog" style={{ width: 'min(100%, 520px)' }}>
                <h3>{t('dues.pay_due')}</h3>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                  {t('dues.supplier_due_desc')}
                </p>

                <form onSubmit={handlePayDue} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>{t('purchases.purchase_number')}:</span>
                      <strong>{selectedPurchase.purchaseNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>{t('purchases.supplier')}:</span>
                      <strong>{selectedPurchase.supplier?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>{t('purchases.due_amount')}:</span>
                      <strong style={{ color: '#ef4444', fontSize: 15 }}>
                        <CurrencyDisplay value={selectedPurchase.dueAmount} />
                      </strong>
                    </div>
                  </div>

                  <div className="form-grid">
                    <FormField label={t('payments.amount')} required>
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

                    <FormField label={t('payments.payment_method')} required>
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
                    <FormField label={t('common.date_time')} required>
                      <input
                        required
                        type="datetime-local"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                      />
                    </FormField>

                    <FormField label={t('payments.reference')}>
                      <input
                        value={payReference}
                        onChange={(e) => setPayReference(e.target.value)}
                        placeholder="Trx ID / Ref"
                      />
                    </FormField>
                  </div>

                  <FormField label={t('common.notes')}>
                    <textarea
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder={t('common.notes')}
                      style={{ minHeight: 60 }}
                    />
                  </FormField>

                  {payError && <div className="form-error">{payError}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setSelectedPurchase(null)}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="primary-button" disabled={paySaving}>
                      {paySaving ? t('common.processing') : t('common.save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
