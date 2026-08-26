'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { api } from '../../../../../lib/api';
import { LoadingSpinner, PageContainer, PageHeader } from '../../../../../components/ui';
import { ProductForm } from '../../../../../components/product-form';
import { useTranslation } from '../../../../../provider';

export default function EditProduct() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['product', id],
    queryFn: () => api<any>(`/products/${id}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('products.edit_product')}
            description={t('products.pricing_stock_policy')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('products.title'), href: '/dashboard/products' },
              { label: t('products.edit_product') },
            ]}
          />
          {q.isLoading ? <LoadingSpinner label={t('common.loading')} /> : q.error ? <div className="error">{q.error.message}</div> : <ProductForm product={q.data} />}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
