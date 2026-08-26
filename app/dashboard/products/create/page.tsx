'use client';

import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { ProductForm } from '../../../../components/product-form';
import { useTranslation } from '../../../../provider';

export default function CreateProduct() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('products.add_product')}
            description={t('products.pricing_stock_policy')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('products.title'), href: '/dashboard/products' },
              { label: t('products.add_product') },
            ]}
          />
          <ProductForm />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
