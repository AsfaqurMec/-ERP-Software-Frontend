'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { ShieldCheck, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../../../provider';

export default function CreateRolePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: rolesData } = useQuery<{ allAvailablePermissions: { category: string; permissions: { id: string; label: string }[] }[] }>({
    queryKey: ['roles'],
    queryFn: () => api('/roles'),
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api('/roles', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      router.push('/dashboard/roles');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create role');
    },
  });

  function togglePermission(id: string) {
    setForm((prev) => {
      const exists = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((p) => p !== id) : [...prev.permissions, id],
      };
    });
  }

  function toggleCategory(catPermissions: { id: string; label: string }[]) {
    const ids = catPermissions.map((p) => p.id);
    const allSelected = ids.every((id) => form.permissions.includes(id));

    setForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !ids.includes(p))
        : Array.from(new Set([...prev.permissions, ...ids])),
    }));
  }

  function selectAll() {
    const allIds: string[] = [];
    rolesData?.allAvailablePermissions?.forEach((cat) => {
      cat.permissions.forEach((p) => allIds.push(p.id));
    });
    setForm((prev) => ({ ...prev, permissions: allIds }));
  }

  function clearAll() {
    setForm((prev) => ({ ...prev, permissions: [] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Role name is required');
      return;
    }
    createMutation.mutate(form);
  }

  const categories = rolesData?.allAvailablePermissions || [];

  return (
    <PageContainer>
      <PageHeader
        title={t('roles.add_role')}
        description={t('roles.security_roles_desc')}
        breadcrumbs={[
          { label: t('common.dashboard'), href: '/dashboard' },
          { label: t('roles.title'), href: '/dashboard/roles' },
          { label: t('roles.add_role') },
        ]}
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

      <form onSubmit={handleSubmit} className="record-form">
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700 }}>{t('roles.title')}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="form-field">
              <label>{t('roles.role_name')} *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Regional Store Supervisor"
              />
            </div>

            <div className="form-field">
              <label>{t('common.description')}</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('common.description')}
              />
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{t('roles.permissions')}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {t('roles.permissions')}: <strong>{form.permissions.length}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={selectAll}
                className="ghost"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {t('common.all')}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="ghost"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {t('common.reset')}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {categories.map((cat, idx) => {
              const catIds = cat.permissions.map((p) => p.id);
              const allChecked = catIds.every((id) => form.permissions.includes(id));
              const someChecked = catIds.some((id) => form.permissions.includes(id));

              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 16,
                    background: '#f8fafc',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 10,
                      marginBottom: 10,
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{cat.category}</span>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.permissions)}
                      style={{
                        background: 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: '#6366f1',
                        fontWeight: 600,
                      }}
                    >
                      {allChecked ? 'Deselect' : 'Select'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 8 }}>
                    {cat.permissions.map((p) => {
                      const isChecked = form.permissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            color: isChecked ? '#1e293b' : '#64748b',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.id)}
                            style={{ accentColor: '#4f46e5', width: 16, height: 16, cursor: 'pointer' }}
                          />
                          <span>{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={() => router.push('/dashboard/roles')} className="ghost">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={createMutation.isPending}
            style={{ padding: '10px 24px' }}
          >
            {createMutation.isPending ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
