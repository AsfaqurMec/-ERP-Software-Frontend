'use client';

import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { DocumentForm } from '../../../../components/document-form';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function CreatePurchase() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('purchases.new_purchase')}
            description={t('documents.purchase_details')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('purchases.title'), href: '/dashboard/purchases' },
              { label: t('purchases.new_purchase') },
            ]}
          />
          <DocumentForm mode="purchase" />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
