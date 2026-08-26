'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { CustomerForm } from '../../../../../components/customer-form';
import { api } from '../../../../../lib/api';
import { LoadingSpinner, PageContainer, PageHeader, ErrorState } from '../../../../../components/ui';
import { useTranslation } from '../../../../../provider';

export default function EditCustomerPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const customerQuery = useQuery({
    queryKey: ['customer-edit', id],
    queryFn: () => api<any>(`/customers/${id}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('customers.edit_customer')}
            description={t('customers.customer_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('customers.title'), href: '/dashboard/customers' },
              { label: t('customers.edit_customer') },
            ]}
          />
          {customerQuery.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : customerQuery.error ? (
            <ErrorState message={customerQuery.error.message} onRetry={() => customerQuery.refetch()} />
          ) : (
            <CustomerForm customer={customerQuery.data} />
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
