import React from 'react';
import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { CustomerForm } from '../../../../components/customer-form';

export default function CreateCustomerPage() {
  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Create Customer"
            description="Add a new client profile with contact information and optional opening balance."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Customers', href: '/dashboard/customers' },
              { label: 'Create' },
            ]}
          />
          <CustomerForm />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
