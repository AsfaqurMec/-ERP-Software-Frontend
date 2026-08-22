'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { FormActions, FormField, FormSection } from './ui';
import { ImageUpload } from './image-upload';
import { useTranslation } from '../provider';

interface CategoryFormProps {
  category?: {
    id?: string;
    name?: string;
    description?: string;
    image?: string;
    status?: string;
  };
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEditing = Boolean(category);

  const [data, setData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || '',
    status: category?.status || 'ACTIVE',
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
        name: data.name.trim(),
        status: data.status,
      };

      if (data.description?.trim()) body.description = data.description.trim();
      if (data.image?.trim()) body.image = data.image.trim();
      else if (isEditing) body.image = null;

      await api(isEditing ? `/categories/${category?.id}` : '/categories', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });

      router.push('/dashboard/categories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save category.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="record-form" onSubmit={submit}>
      <FormSection title={t('categories.category_info')}>
        <div className="form-grid">
          <FormField label={t('categories.category_name')} required>
            <input
              required
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Computers & Laptops"
            />
          </FormField>

          <FormField label={t('common.status')} required>
            <select value={data.status} onChange={(e) => set('status', e.target.value)}>
              <option value="ACTIVE">{t('common.active')}</option>
              <option value="INACTIVE">{t('common.inactive')}</option>
            </select>
          </FormField>

          <div style={{ gridColumn: 'span 2' }}>
            <ImageUpload
              label={t('categories.category_image')}
              value={data.image}
              onChange={(url) => set('image', url)}
              folder="categories"
              description="Upload category thumbnail/banner photo directly to Cloudinary (JPG, PNG, WebP up to 10MB)"
            />
          </div>
        </div>

        <FormField label={t('common.description')}>
          <textarea
            value={data.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Category specifications or group details…"
          />
        </FormField>
      </FormSection>

      {error && <div className="form-error">{error}</div>}

      <FormActions>
        <button type="button" onClick={() => router.back()}>
          {t('common.cancel')}
        </button>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? t('common.saving') : isEditing ? t('categories.edit_category') : t('categories.add_category')}
        </button>
      </FormActions>
    </form>
  );
}
