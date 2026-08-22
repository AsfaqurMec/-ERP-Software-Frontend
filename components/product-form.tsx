'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, extractItems } from '../lib/api';
import { FormActions, FormField, FormSection, LoadingSpinner } from './ui';
import { ImageUpload } from './image-upload';
import { useTranslation } from '../provider';

interface ProductFormProps {
  product?: any;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEditing = Boolean(product);

  const [data, setData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    barcode: product?.barcode || '',
    categoryId: product?.categoryId || '',
    supplierId: product?.supplierId || '',
    brand: product?.brand || '',
    description: product?.description || '',
    image: product?.image || '',
    unit: product?.unit || 'pcs',
    purchasePrice: product?.purchasePrice !== undefined ? String(product.purchasePrice) : '',
    sellingPrice: product?.sellingPrice !== undefined ? String(product.sellingPrice) : '',
    wholesalePrice: product?.wholesalePrice !== undefined && product?.wholesalePrice !== null ? String(product.wholesalePrice) : '',
    openingStock: '0',
    minimumStock: product?.minimumStock !== undefined ? String(product.minimumStock) : '0',
    maximumStock: product?.maximumStock !== undefined && product?.maximumStock !== null ? String(product.maximumStock) : '',
    status: product?.status || 'ACTIVE',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['categories-select'],
    queryFn: () => api('/categories'),
  });

  const suppliersQuery = useQuery({
    queryKey: ['suppliers-select'],
    queryFn: () => api('/suppliers?limit=100'),
  });

  const set = (key: string, value: string) => setData((d) => ({ ...d, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: Record<string, any> = {
        sku: data.sku.trim(),
        name: data.name.trim(),
        categoryId: data.categoryId,
        unit: data.unit || 'pcs',
        purchasePrice: Number(data.purchasePrice),
        sellingPrice: Number(data.sellingPrice),
        minimumStock: Number(data.minimumStock || 0),
        status: data.status,
      };

      if (data.barcode?.trim()) payload.barcode = data.barcode.trim();
      if (data.supplierId?.trim()) payload.supplierId = data.supplierId.trim();
      if (data.brand?.trim()) payload.brand = data.brand.trim();
      if (data.description?.trim()) payload.description = data.description.trim();
      if (data.image?.trim()) payload.image = data.image.trim();
      if (data.wholesalePrice !== '' && data.wholesalePrice !== undefined) {
        payload.wholesalePrice = Number(data.wholesalePrice);
      }
      if (data.maximumStock !== '' && data.maximumStock !== undefined) {
        payload.maximumStock = Number(data.maximumStock);
      }

      if (!isEditing && Number(data.openingStock) > 0) {
        payload.openingStock = Number(data.openingStock);
      }

      await api(isEditing ? `/products/${product.id}` : '/products', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });

      router.push('/dashboard/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  }

  if (categoriesQuery.isLoading || suppliersQuery.isLoading) {
    return <LoadingSpinner label={t('common.loading')} />;
  }

  const categories = extractItems<any>(categoriesQuery.data);
  const suppliers = extractItems<any>(suppliersQuery.data);

  return (
    <form className="record-form" onSubmit={submit}>
      <FormSection title={t('products.basic_info')}>
        <div className="form-grid">
          <FormField label={t('products.name')} required>
            <input
              required
              value={data.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Wireless Ergonomic Mouse"
            />
          </FormField>
          <FormField label={t('products.sku')} required>
            <input
              required
              value={data.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="e.g. PRD-MOUSE-001"
            />
          </FormField>
          <FormField label={t('products.category')} required>
            <select
              required
              value={data.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
            >
              <option value="">{t('products.all_categories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('products.supplier')}>
            <select
              value={data.supplierId}
              onChange={(e) => set('supplierId', e.target.value)}
            >
              <option value="">{t('common.all')}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t('products.barcode')}>
            <input
              value={data.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              placeholder="e.g. 890123456789"
            />
          </FormField>
          <FormField label={t('products.brand')}>
            <input
              value={data.brand}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="e.g. Logitech"
            />
          </FormField>
          <FormField label={t('products.unit')} required>
            <select value={data.unit} onChange={(e) => set('unit', e.target.value)}>
              {['pcs', 'box', 'kg', 'meter', 'liter', 'pack', 'pair'].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FormField>
          <div style={{ gridColumn: 'span 2' }}>
            <ImageUpload
              label={t('products.product_photo')}
              value={data.image}
              onChange={(url) => set('image', url)}
              folder="products"
              description="Upload product photo directly to Cloudinary CDN (JPG, PNG, WebP up to 10MB)"
            />
          </div>
        </div>
        <FormField label={t('common.description')}>
          <textarea
            value={data.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Product details, specifications, warranty..."
          />
        </FormField>
      </FormSection>

      <FormSection title={t('products.pricing_stock_policy')}>
        <div className="form-grid">
          <FormField label={`${t('products.purchase_price')} (BDT)`} required>
            <input
              required
              min="0"
              type="number"
              step="0.01"
              value={data.purchasePrice}
              onChange={(e) => set('purchasePrice', e.target.value)}
              placeholder="0.00"
            />
          </FormField>
          <FormField label={`${t('products.selling_price')} (BDT)`} required>
            <input
              required
              min="0"
              type="number"
              step="0.01"
              value={data.sellingPrice}
              onChange={(e) => set('sellingPrice', e.target.value)}
              placeholder="0.00"
            />
          </FormField>
          <FormField label={`${t('products.wholesale_price')} (BDT)`}>
            <input
              min="0"
              type="number"
              step="0.01"
              value={data.wholesalePrice}
              onChange={(e) => set('wholesalePrice', e.target.value)}
              placeholder="Optional"
            />
          </FormField>

          {!isEditing && (
            <FormField label={t('products.opening_stock')}>
              <input
                min="0"
                type="number"
                step="0.001"
                value={data.openingStock}
                onChange={(e) => set('openingStock', e.target.value)}
                placeholder="Initial count"
              />
            </FormField>
          )}

          <FormField label={t('products.minimum_stock')}>
            <input
              min="0"
              type="number"
              value={data.minimumStock}
              onChange={(e) => set('minimumStock', e.target.value)}
              placeholder="0"
            />
          </FormField>
          <FormField label={t('products.maximum_stock')}>
            <input
              min="0"
              type="number"
              value={data.maximumStock}
              onChange={(e) => set('maximumStock', e.target.value)}
              placeholder="Optional"
            />
          </FormField>
          <FormField label={t('common.status')} required>
            <select value={data.status} onChange={(e) => set('status', e.target.value)}>
              <option value="ACTIVE">{t('common.active')}</option>
              <option value="INACTIVE">{t('common.inactive')}</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      {error && <div className="form-error">{error}</div>}

      <FormActions>
        <button type="button" onClick={() => router.back()}>
          {t('common.cancel')}
        </button>
        <button className="primary-button" disabled={saving}>
          {saving ? t('common.saving') : isEditing ? t('products.edit_product') : t('products.add_product')}
        </button>
      </FormActions>
    </form>
  );
}
