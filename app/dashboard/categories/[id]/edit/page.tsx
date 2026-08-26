'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../../components/auth-guard';
import { Shell } from '../../../../../components/shell';
import { CategoryForm } from '../../../../../components/category-form';
import { api } from '../../../../../lib/api';
import { LoadingSpinner, PageContainer, PageHeader } from '../../../../../components/ui';
import { useTranslation } from '../../../../../provider';

export default function EditCategory() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['category', id],
    queryFn: () => api<any>(`/categories/${id}`),
  });

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('categories.edit_category')}
            description={t('categories.category_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('categories.title'), href: '/dashboard/categories' },
              { label: t('categories.edit_category') },
            ]}
          />
          {q.isLoading ? (
            <LoadingSpinner label={t('common.loading')} />
          ) : q.error ? (
            <div className="error">{q.error.message}</div>
          ) : (
            <CategoryForm category={q.data} />
          )}
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
