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
import { Coins, ArrowDownLeft, ReceiptText, Eye, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../../../provider';

export default function CustomerDuePage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  // Receive Due Modal State
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
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

  const dueSalesQuery = useQuery({
    queryKey: ['customer-due-sales', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/sales?${queryParams}`),
  });

  const overviewQuery = useQuery({
    queryKey: ['payments-overview-stat'],
    queryFn: () => api<any>('/payments/overview'),
  });

  const ov = overviewQuery.data;

  function openReceiveDueModal(sale: any) {
    setSelectedSale(sale);
    setPayAmount(String(sale.dueAmount || ''));
    setPayReference(`INV-${sale.invoiceNumber}`);
    setPayDate(new Date().toISOString().slice(0, 16));
    setPayNote('');
    setPayError('');
  }

  async function handleReceivePayment(e: FormEvent) {
    e.preventDefault();
    if (!selectedSale || !selectedSale.customer) {
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
          partyType: 'CUSTOMER',
          partyId: selectedSale.customer.id,
          saleId: selectedSale.id,
          amount: Number(payAmount),
          date: new Date(payDate).toISOString(),
          method: payMethod,
          reference: payReference || `Collection for ${selectedSale.invoiceNumber}`,
          note: payNote || undefined,
        }),
      });

      setSelectedSale(null);
      setPayAmount('');
      setPayReference('');
      setPayNote('');
      dueSalesQuery.refetch();
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
            title={t('dues.customer_due_title')}
            description={t('dues.customer_due_desc')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('payments.title'), href: '/dashboard/payments' },
              { label: t('dues.customer_due_title') },
            ]}
          />

          {ov && (
            <StatCardGrid columns={3}>
              <StatCard
                label={t('dues.total_receivable')}
                value={<CurrencyDisplay value={ov.totalReceivable} />}
                detail={t('dashboard.receivable_due')}
                icon={<Coins color="#d28d2b" size={20} />}
                kind="amber"
              />
              <StatCard
                label={t('payments.collected_today')}
                value={<CurrencyDisplay value={ov.receivedToday} />}
                detail={t('payments.customer_collections')}
                icon={<ArrowDownLeft color="#28a476" size={20} />}
                kind="green"
              />
              <StatCard
                label={t('dues.due_orders_count')}
                value={String(dueSalesQuery.data?.meta.total ?? '—')}
                detail={t('sales.title')}
                icon={<ReceiptText color="#6366f1" size={20} />}
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
              placeholder={t('sales.search_placeholder')}
            />
          </DataTableToolbar>

          {dueSalesQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : dueSalesQuery.error ? (
            <div className="error">{dueSalesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  t('sales.invoice_number'),
                  t('common.date'),
                  t('sales.customer'),
                  t('sales.grand_total'),
                  t('sales.paid_amount'),
                  t('sales.due_amount'),
                  t('sales.payment_status'),
                  t('common.actions'),
                ]}
              >
                {dueSalesQuery.data?.data.length ? (
                  dueSalesQuery.data.data.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/dashboard/sales/${s.id}`} style={{ fontWeight: 700, color: '#4f46e5' }}>
                          <code>{s.invoiceNumber}</code>
                        </Link>
                      </td>
                      <td>
                        <DateDisplay value={s.saleDate} />
                      </td>
                      <td>
                        {s.customer ? (
                          <div>
                            <Link href={`/dashboard/customers/${s.customer.id}`} style={{ fontWeight: 700, color: '#1e293b' }}>
                              {s.customer.name}
                            </Link>
                            {s.customer.phone && (
                              <small style={{ display: 'block', color: '#64748b', fontSize: 11 }}>
                                {s.customer.phone}
                              </small>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>{t('common.walk_in_customer')}</span>
                        )}
                      </td>
                      <td>
                        <strong>
                          <CurrencyDisplay value={s.grandTotal} />
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: '#188b64', fontWeight: 600 }}>
                          <CurrencyDisplay value={s.paidAmount} />
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#ef4444', fontSize: 14 }}>
                          <CurrencyDisplay value={s.dueAmount} />
                        </strong>
                      </td>
                      <td>
                        <PaymentStatusBadge value={s.paymentStatus} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {s.customer && (
                            <button
                              type="button"
                              onClick={() => openReceiveDueModal(s)}
                              className="primary-button"
                              style={{
                                padding: '6px 10px',
                                fontSize: 12,
                                gap: 4,
                              }}
                              title={t('dues.receive_due')}
                            >
                              <Coins size={14} /> {t('dues.receive_due')}
                            </button>
                          )}
                          <Link
                            href={`/dashboard/sales/${s.id}`}
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
                total={dueSalesQuery.data?.meta.total || 0}
                limit={limit}
                onPage={setPage}
                onLimitChange={setLimit}
              />
            </>
          )}

          {/* Receive Customer Due Modal */}
          {selectedSale && (
            <div className="dialog-backdrop">
              <div className="dialog" style={{ width: 'min(100%, 520px)' }}>
                <h3>{t('dues.receive_due')}</h3>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                  {t('dues.customer_due_desc')}
                </p>

                <form onSubmit={handleReceivePayment} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>{t('sales.invoice_number')}:</span>
                      <strong>{selectedSale.invoiceNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>{t('sales.customer')}:</span>
                      <strong>{selectedSale.customer?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>{t('sales.due_amount')}:</span>
                      <strong style={{ color: '#ef4444', fontSize: 15 }}>
                        <CurrencyDisplay value={selectedSale.dueAmount} />
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
                    <button type="button" onClick={() => setSelectedSale(null)}>
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
