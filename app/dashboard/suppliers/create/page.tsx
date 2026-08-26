'use client';

import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { SupplierForm } from '../../../../components/supplier-form';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function CreateSupplier() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('suppliers.add_supplier')}
            description={t('suppliers.supplier_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('suppliers.title'), href: '/dashboard/suppliers' },
              { label: t('suppliers.add_supplier') },
            ]}
          />
          <SupplierForm />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
