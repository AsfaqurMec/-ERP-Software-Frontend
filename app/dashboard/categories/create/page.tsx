'use client';

import { AuthGuard } from '../../../../components/auth-guard';
import { Shell } from '../../../../components/shell';
import { CategoryForm } from '../../../../components/category-form';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { useTranslation } from '../../../../provider';

export default function CreateCategory() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title={t('categories.add_category')}
            description={t('categories.category_info')}
            breadcrumbs={[
              { label: t('common.dashboard'), href: '/dashboard' },
              { label: t('categories.title'), href: '/dashboard/categories' },
              { label: t('categories.add_category') },
            ]}
          />
          <CategoryForm />
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
