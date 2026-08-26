'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { SupplierForm } from '../../../../../components/supplier-form';
import { api } from '../../../../../lib/api';
import { LoadingSpinner, PageContainer, PageHeader } from '../../../../../components/ui';
import { useTranslation } from '../../../../../provider';

export default function EditSupplier() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => api<any>(`/suppliers/${id}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('suppliers.edit_supplier')}
            description={t('suppliers.supplier_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('suppliers.title'), href: '/dashboard/suppliers' },
              { label: t('suppliers.edit_supplier') },
            ]}
          />
          {q.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : q.error ? (
            <div className="error">{q.error.message}</div>
          ) : (
            <SupplierForm supplier={q.data} />
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
