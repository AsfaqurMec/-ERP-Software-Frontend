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
      setPayError('Cannot record payment: Customer details missing on walk-in sale.');
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
      setPayError(err instanceof Error ? err.message : 'Failed to record customer collection.');
    } finally {
      setPaySaving(false);
    }
  }

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Customer Due & Receivables"
            description="Manage all sales orders with outstanding balances and collect customer dues."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Finance & Accounts', href: '/dashboard/payments' },
              { label: 'Customer Due' },
            ]}
          />

          {ov && (
            <StatCardGrid columns={3}>
              <StatCard
                label="Total Outstanding Customer Due"
                value={<CurrencyDisplay value={ov.totalReceivable} />}
                detail="Aggregate unpaid customer receivables"
                icon={<Coins color="#d28d2b" size={20} />}
                kind="amber"
              />
              <StatCard
                label="Collected Today"
                value={<CurrencyDisplay value={ov.receivedToday} />}
                detail="Cash & digital collections received today"
                icon={<ArrowDownLeft color="#28a476" size={20} />}
                kind="green"
              />
              <StatCard
                label="Due Orders Count"
                value={String(dueSalesQuery.data?.meta.total ?? '—')}
                detail="Active sales invoices with pending due"
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
              placeholder="Search invoice number, customer name, phone, or area…"
            />
          </DataTableToolbar>

          {dueSalesQuery.isLoading ? (
            <LoadingSpinner label="Loading customer due sales orders…" />
          ) : dueSalesQuery.error ? (
            <div className="error">{dueSalesQuery.error.message}</div>
          ) : (
            <>
              <DataTable
                columns={[
                  'Invoice #',
                  'Sale Date',
                  'Customer',
                  'Grand Total',
                  'Paid Amount',
                  'Outstanding Due',
                  'Payment Status',
                  'Actions',
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
                          <span style={{ color: '#64748b' }}>Walk-in Customer</span>
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
                              title="Receive customer due payment"
                            >
                              <Coins size={14} /> Receive Due
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
                            title="View sale invoice details"
                          >
                            <Eye size={14} /> View Order
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <EmptyTableState message="No sales orders with outstanding due found." />
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
                <h3>Receive Customer Due Payment</h3>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                  Collect outstanding balance from <strong>{selectedSale.customer?.name}</strong> for Invoice #{selectedSale.invoiceNumber}.
                </p>

                <form onSubmit={handleReceivePayment} style={{ display: 'grid', gap: 14 }}>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Invoice Number:</span>
                      <strong>{selectedSale.invoiceNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Customer:</span>
                      <strong>{selectedSale.customer?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Outstanding Due on Invoice:</span>
                      <strong style={{ color: '#ef4444', fontSize: 15 }}>
                        <CurrencyDisplay value={selectedSale.dueAmount} />
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

                    <FormField label="Reference / Cheque / Trx ID">
                      <input
                        value={payReference}
                        onChange={(e) => setPayReference(e.target.value)}
                        placeholder="e.g. Trx-998822 or Cheque #"
                      />
                    </FormField>
                  </div>

                  <FormField label="Notes / Remarks">
                    <textarea
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="Optional receipt notes or bank details…"
                      style={{ minHeight: 60 }}
                    />
                  </FormField>

                  {payError && <div className="form-error">{payError}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setSelectedSale(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={paySaving}>
                      {paySaving ? 'Processing…' : 'Confirm Collection'}
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
