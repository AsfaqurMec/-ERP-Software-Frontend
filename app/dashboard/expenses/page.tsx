'use client';

import React, { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { api } from '../../../lib/api';
import {
  CurrencyDisplay,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DateDisplay,
  EmptyTableState,
  FilterDropdown,
  LoadingSpinner,
  PageContainer,
  PageHeader,
  SearchInput,
  StatusBadge,
  FormField,
} from '../../../components/ui';

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Record expense modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState('Rent');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 16));
  const [expMethod, setExpMethod] = useState('BANK');
  const [expDesc, setExpDesc] = useState('');
  const [expNote, setExpNote] = useState('');
  const [expSaving, setExpSaving] = useState(false);
  const [expError, setExpError] = useState('');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  });

  const expensesQuery = useQuery({
    queryKey: ['expenses-list', queryParams.toString()],
    queryFn: () => api<{ data: any[]; meta: { total: number } }>(`/expenses?${queryParams}`),
  });

  const categories = [
    'Rent',
    'Salary',
    'Electricity',
    'Internet',
    'Transportation',
    'Packaging',
    'Marketing',
    'Maintenance',
    'Office',
    'Other',
  ];

  async function handleRecordExpense(e: FormEvent) {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) {
      setExpError('Amount must be greater than zero.');
      return;
    }

    setExpSaving(true);
    setExpError('');

    try {
      await api('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: expCategory,
          amount: Number(expAmount),
          date: new Date(expDate).toISOString(),
          paymentMethod: expMethod,
          description: expDesc || undefined,
          note: expNote || undefined,
        }),
      });

      setModalOpen(false);
      setExpAmount('');
      setExpDesc('');
      setExpNote('');
      expensesQuery.refetch();
    } catch (err) {
      setExpError(err instanceof Error ? err.message : 'Could not save expense.');
    } finally {
      setExpSaving(false);
    }
  }

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Operating Expenses"
            description="Record and analyze operational expenditures across your business facilities."
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Expenses' }]}
            action={
              <button type="button" className="primary-button" onClick={() => setModalOpen(true)}>
                + Record Expense
              </button>
            }
          />

          <DataTableToolbar>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search description, note or category…"
            />

            <FilterDropdown
              label="All Expense Categories"
              value={category}
              onChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
              options={categories.map((c) => ({ label: c, value: c }))}
            />
          </DataTableToolbar>

          {expensesQuery.isLoading ? (
            <LoadingSpinner label="Loading operating expenses…" />
          ) : expensesQuery.error ? (
            <div className="error">{expensesQuery.error.message}</div>
          ) : (
            <>
              <DataTable columns={['Date', 'Category', 'Amount', 'Payment Method', 'Description', 'Notes']}>
                {expensesQuery.data?.data.length ? (
                  expensesQuery.data.data.map((e: any) => (
                    <tr key={e.id}>
                      <td>
                        <DateDisplay value={e.date} />
                      </td>
                      <td>
                        <strong>{e.category}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#d96a77' }}>
                          <CurrencyDisplay value={e.amount} />
                        </strong>
                      </td>
                      <td>
                        <StatusBadge value={e.paymentMethod} />
                      </td>
                      <td>{e.description || '—'}</td>
                      <td>{e.note || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyTableState message="No expense records found." />
                    </td>
                  </tr>
                )}
              </DataTable>

              <DataTablePagination
                page={page}
                total={expensesQuery.data?.meta.total || 0}
                limit={limit}
                onPage={setPage}
                onLimitChange={setLimit}
              />
            </>
          )}

          {/* Record Expense Modal */}
          {modalOpen && (
            <div className="dialog-backdrop">
              <div className="dialog" style={{ width: 'min(100%, 520px)' }}>
                <h3>Record Operating Expense</h3>
                <p style={{ margin: '4px 0 16px', fontSize: 13, color: '#64748b' }}>
                  Add an expense entry to deduct from your gross profit calculations.
                </p>

                <form onSubmit={handleRecordExpense} style={{ display: 'grid', gap: 14 }}>
                  <div className="form-grid">
                    <FormField label="Expense Category" required>
                      <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Amount (BDT)" required>
                      <input
                        required
                        min="0.01"
                        step="0.01"
                        type="number"
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </FormField>
                  </div>

                  <div className="form-grid">
                    <FormField label="Date & Time" required>
                      <input
                        required
                        type="datetime-local"
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Payment Method" required>
                      <select value={expMethod} onChange={(e) => setExpMethod(e.target.value)}>
                        {['CASH', 'BANK', 'BKASH', 'NAGAD', 'CARD', 'OTHER'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Description / Vendor">
                    <input
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="e.g. Electricity bill for main office"
                    />
                  </FormField>

                  <FormField label="Additional Notes">
                    <textarea
                      value={expNote}
                      onChange={(e) => setExpNote(e.target.value)}
                      placeholder="Optional notes or receipt references…"
                      style={{ minHeight: 60 }}
                    />
                  </FormField>

                  {expError && <div className="form-error">{expError}</div>}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setModalOpen(false)}>
                      Cancel
                    </button>
                    <button className="primary-button" disabled={expSaving}>
                      {expSaving ? 'Saving…' : 'Record Expense'}
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
