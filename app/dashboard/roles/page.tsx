'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { PageContainer, PageHeader } from '../../../components/ui';
import { ShieldCheck, Plus, Users, Edit, Trash2, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../../hooks/use-auth';
import { useTranslation } from '../../../provider';

export default function RolesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ items: any[]; allAvailablePermissions: any[] }>({
    queryKey: ['roles'],
    queryFn: () => api('/roles'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/roles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteId(null);
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to delete role');
    },
  });

  const canCreateRole = hasPermission('roles.create');
  const canUpdateRole = hasPermission('roles.update');
  const canDeleteRole = hasPermission('roles.delete');

  return (
    <PageContainer>
      <PageHeader
        title={t('roles.title')}
        description={t('roles.description')}
        breadcrumbs={[
          { label: t('common.dashboard'), href: '/dashboard' },
          { label: t('roles.title') },
        ]}
        action={
          canCreateRole && (
            <Link href="/dashboard/roles/create" className="primary-button">
              <Plus size={16} style={{ marginRight: 6 }} />
              {t('roles.create_role')}
            </Link>
          )
        }
      />

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="skeleton" style={{ height: 260 }}>
          {t('common.loading')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {data?.items.map((role) => {
            const isFullAdmin = Array.isArray(role.permissions) && role.permissions.includes('*');
            const permCount = isFullAdmin ? 'ALL (*)' : Array.isArray(role.permissions) ? role.permissions.length : 0;

            return (
              <div
                key={role.id}
                className="card"
                style={{
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: role.isSystem ? '1px solid #e0e7ff' : '1px solid #edf0f7',
                  background: '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: role.isSystem ? '#eef2ff' : '#f1f5f9',
                          color: role.isSystem ? '#4f46e5' : '#475569',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{role.name}</h3>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {role.isSystem ? 'System Defined Role' : 'Custom Defined Role'}
                        </span>
                      </div>
                    </div>

                    {role.isSystem ? (
                      <span className="pill" style={{ background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={10} /> System
                      </span>
                    ) : (
                      <span className="pill" style={{ background: '#f1f5f9', color: '#475569' }}>
                        Custom
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.83rem', color: '#64748b', margin: '0 0 16px', minHeight: 38, lineHeight: 1.4 }}>
                    {role.description || 'Custom organizational permission policy'}
                  </p>

                  <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
                      <Users size={14} color="#6366f1" />
                      <strong>{role.userCount}</strong> {t('users.title')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
                      <CheckCircle2 size={14} color="#10b981" />
                      <strong>{permCount}</strong> {t('roles.permissions')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                  {canUpdateRole && (
                    <Link
                      href={`/dashboard/roles/${role.id}/edit`}
                      className="ghost"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Edit size={13} /> {t('common.edit')}
                    </Link>
                  )}

                  {!role.isSystem && canDeleteRole && (
                    <button
                      type="button"
                      onClick={() => setDeleteId(role.id)}
                      className="ghost"
                      style={{ padding: '6px 10px', color: '#dc2626', borderColor: '#fecaca' }}
                      title={t('common.delete')}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>{t('roles.delete_role')}</h3>
            <p>
              {t('common.delete_confirm')}
            </p>
            <div>
              <button type="button" onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
