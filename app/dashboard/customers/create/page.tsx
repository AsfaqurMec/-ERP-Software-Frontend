'use client';

import React from 'react';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { CustomerForm } from '../../../../components/customer-form';
import { useTranslation } from '../../../../provider';

export default function CreateCustomerPage() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('customers.add_customer')}
            description={t('customers.customer_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('customers.title'), href: '/dashboard/customers' },
              { label: t('customers.add_customer') },
            ]}
          />
          <CustomerForm />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
