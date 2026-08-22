'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { CustomerForm } from '../../../../../components/customer-form';
import { api } from '../../../../../lib/api';
import { LoadingSpinner, PageContainer, PageHeader, ErrorState } from '../../../../../components/ui';

export default function EditCustomerPage() {
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
            title="Edit Customer"
            description="Update customer contact information and status."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Customers', href: '/dashboard/customers' },
              { label: 'Edit' },
            ]}
          />
          {customerQuery.isLoading ? (
            <LoadingSpinner label="Loading customer details…" />
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
