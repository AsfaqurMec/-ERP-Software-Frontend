'use client';

import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { DocumentForm } from '../../../../components/document-form';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function CreateSale() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('sales.new_sale')}
            description={t('documents.sale_details')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('sales.title'), href: '/dashboard/sales' },
              { label: t('sales.new_sale') },
            ]}
          />
          <DocumentForm mode="sale" />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
