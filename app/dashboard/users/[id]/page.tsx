'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { User, Shield, Key, Edit, Calendar, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { usePermissions } from '../../../../hooks/use-auth';
import { useTranslation } from '../../../../provider';

export default function UserDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = usePermissions();

  const { data: user, isLoading } = useQuery<any>({
    queryKey: ['user', id],
    queryFn: () => api(`/users/${id}`),
    enabled: Boolean(id),
  });

  const canUpdateUser = hasPermission(['users.update', 'users.manage']);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="skeleton" style={{ height: 300 }}>
          {t('common.loading')}
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          {t('common.no_records_found')}
        </div>
      </PageContainer>
    );
  }

  const permissions = user.permissions || [];
  const isSuperAdmin = permissions.includes('*') || user.role === 'SUPER_ADMIN';

  return (
    <PageContainer>
      <PageHeader
        title={`${t('users.title')}: ${user.name}`}
        description={t('users.users_directory_desc')}
        breadcrumbs={[
          { label: t('common.dashboard'), href: '/dashboard' },
          { label: t('users.title'), href: '/dashboard/users' },
          { label: user.name },
        ]}
        action={
          canUpdateUser && (
            <Link href={`/dashboard/users/${user.id}/edit`} className="primary-button">
              <Edit size={15} style={{ marginRight: 6 }} />
              {t('users.edit_user')}
            </Link>
          )
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* User Card */}
        <div className="card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{user.name}</h3>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 2 }}>{user.email}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span className="pill" style={{ background: '#ede9fe', color: '#5b21b6', fontWeight: 700 }}>
                  {user.roleName || user.role}
                </span>
                <span className={`pill ${user.status === 'ACTIVE' ? 'success' : ''}`}>
                  {user.status === 'ACTIVE' ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>
          </div>

          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: 0, fontSize: '0.88rem' }}>
            <div>
              <dt style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>{t('common.phone')}</dt>
              <dd style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{user.phone || '—'}</dd>
            </div>
            <div>
              <dt style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>{t('common.status')}</dt>
              <dd style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{user.status === 'ACTIVE' ? t('common.active') : t('common.inactive')}</dd>
            </div>
            <div>
              <dt style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>{t('common.date')}</dt>
              <dd style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>{t('users.last_active')}</dt>
              <dd style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Assigned Permissions Matrix */}
        <div className="card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{t('roles.permissions')}</h3>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
            {t('roles.security_roles_desc')} (<strong>{user.roleName || user.role}</strong>):
          </p>

          {isSuperAdmin ? (
            <div style={{ padding: 14, borderRadius: 8, background: '#fef3c7', color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>
              ★ Super Admin: Full Unrestricted Access (*) Across All Enterprise Modules
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
              {permissions.map((p: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={11} color="#10b981" />
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
