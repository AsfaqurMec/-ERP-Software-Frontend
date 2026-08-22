'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { FormActions, FormField, FormSection } from './ui';
import { useTranslation } from '../provider';

interface CustomerFormProps {
  customer?: any;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEditing = Boolean(customer);

  const [data, setData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    openingBalance: customer?.openingBalance !== undefined ? String(customer.openingBalance) : '0',
    notes: customer?.notes || '',
    status: customer?.status || 'ACTIVE',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const body: Record<string, any> = {
        name: data.name,
        status: data.status,
      };

      if (data.phone) body.phone = data.phone;
      if (data.email) body.email = data.email;
      if (data.address) body.address = data.address;
      if (data.notes) body.notes = data.notes;
      if (!isEditing) {
        body.openingBalance = Number(data.openingBalance || 0);
      }

      await api(isEditing ? `/customers/${customer.id}` : '/customers', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });

      router.push('/dashboard/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save customer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="record-form" onSubmit={submit}>
      <FormSection title={t('customers.customer_info')}>
        <div className="form-grid">
          <FormField label={t('customers.customer_name')} required>
            <input
              required
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Rahim Enterprise"
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
              placeholder="e.g. rahim@example.com"
            />
          </FormField>

          {!isEditing && (
            <FormField label={t('customers.opening_balance')}>
              <input
                min="0"
                type="number"
                step="0.01"
                value={data.openingBalance}
                onChange={(e) => set('openingBalance', e.target.value)}
                placeholder="Initial receivable balance"
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

        <FormField label={t('customers.billing_address')}>
          <textarea
            value={data.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Street address, city, postal code…"
          />
        </FormField>

        <FormField label={t('customers.customer_notes')}>
          <textarea
            value={data.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Special credit terms, delivery preferences…"
          />
        </FormField>
      </FormSection>

      {error && <div className="form-error">{error}</div>}

      <FormActions>
        <button type="button" onClick={() => router.back()}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? t('common.saving') : isEditing ? t('customers.edit_customer') : t('customers.add_customer')}
        </button>
      </FormActions>
    </form>
  );
}
