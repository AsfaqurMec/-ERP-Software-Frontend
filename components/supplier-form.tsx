'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { FormActions, FormField, FormSection } from './ui';
import { useTranslation } from '../provider';

interface SupplierFormProps {
  supplier?: {
    id?: string;
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    address?: string;
    openingBalance?: number;
    notes?: string;
    status?: string;
  };
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEditing = Boolean(supplier);

  const [data, setData] = useState({
    name: supplier?.name || '',
    company: supplier?.company || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    openingBalance: supplier?.openingBalance !== undefined ? String(supplier.openingBalance) : '0',
    notes: supplier?.notes || '',
    status: supplier?.status || 'ACTIVE',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setData((d) => ({ ...d, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body: Record<string, any> = {
        name: data.name,
        status: data.status,
      };

      if (data.company) body.company = data.company;
      if (data.phone) body.phone = data.phone;
      if (data.email) body.email = data.email;
      if (data.address) body.address = data.address;
      if (data.notes) body.notes = data.notes;
      if (!isEditing) {
        body.openingBalance = Number(data.openingBalance || 0);
      }

      await api(isEditing ? `/suppliers/${supplier?.id}` : '/suppliers', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });

      router.push('/dashboard/suppliers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save supplier.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="record-form" onSubmit={submit}>
      <FormSection title={t('suppliers.supplier_info')}>
        <div className="form-grid">
          <FormField label={t('suppliers.supplier_name')} required>
            <input
              required
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Metro Wholesale Distributors"
            />
          </FormField>

          <FormField label={t('suppliers.company_name')}>
            <input
              value={data.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="e.g. Metro Trading Ltd."
            />
          </FormField>

          <FormField label={t('common.phone')}>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="e.g. +880 1700-000000"
            />
          </FormField>

          <FormField label={t('common.email')}>
            <input
              type="email"
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="e.g. supplier@example.com"
            />
          </FormField>

          {!isEditing && (
            <FormField label={t('suppliers.opening_balance')}>
              <input
                min="0"
                type="number"
                step="0.01"
                value={data.openingBalance}
                onChange={(e) => set('openingBalance', e.target.value)}
                placeholder="Initial due balance"
              />
            </FormField>
          )}

          <FormField label={t('common.status')} required>
            <select value={data.status} onChange={(e) => set('status', e.target.value)}>
              <option value="ACTIVE">{t('common.active')}</option>
              <option value="INACTIVE">{t('common.inactive')}</option>
            </select>
          </FormField>
        </div>

        <FormField label={t('suppliers.warehouse_address')}>
          <textarea
            value={data.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Supplier warehouse, office address…"
          />
        </FormField>

        <FormField label={t('suppliers.supplier_notes')}>
          <textarea
            value={data.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Payment terms, bank account info, contact schedule…"
          />
        </FormField>
      </FormSection>

      {error && <div className="form-error">{error}</div>}

      <FormActions>
        <button type="button" onClick={() => router.back()}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? t('common.saving') : isEditing ? t('suppliers.edit_supplier') : t('suppliers.add_supplier')}
        </button>
      </FormActions>
    </form>
  );
}
