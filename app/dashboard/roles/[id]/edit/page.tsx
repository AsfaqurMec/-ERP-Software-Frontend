'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../../lib/api';
import { PageContainer, PageHeader } from '../../../../../components/ui';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function EditRolePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: roleData, isLoading } = useQuery<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
    allAvailablePermissions: { category: string; permissions: { id: string; label: string }[] }[];
  }>({
    queryKey: ['role', id],
    queryFn: () => api(`/roles/${id}`),
    enabled: Boolean(id),
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (roleData) {
      setForm({
        name: roleData.name || '',
        description: roleData.description || '',
        permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
      });
    }
  }, [roleData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
      router.push('/dashboard/roles');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update role');
    },
  });

  function togglePermission(permId: string) {
    setForm((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((p) => p !== permId) : [...prev.permissions, permId],
      };
    });
  }

  function toggleCategory(catPermissions: { id: string; label: string }[]) {
    const ids = catPermissions.map((p) => p.id);
    const allSelected = ids.every((permId) => form.permissions.includes(permId));

    setForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !ids.includes(p))
        : Array.from(new Set([...prev.permissions, ...ids])),
    }));
  }

  function selectAll() {
    const allIds: string[] = [];
    roleData?.allAvailablePermissions?.forEach((cat) => {
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
    updateMutation.mutate(form);
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="skeleton" style={{ height: 300 }}>
          Loading role matrix...
        </div>
      </PageContainer>
    );
  }

  const categories = roleData?.allAvailablePermissions || [];

  return (
    <PageContainer>
      <PageHeader
        title={`Edit Role: ${roleData?.name}`}
        description="Update role privileges and adjust module access rules."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roles & Permissions', href: '/dashboard/roles' },
          { label: 'Edit Role' },
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
          <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700 }}>Role Identity</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div className="form-field">
              <label>Role Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={roleData?.isSystem}
                style={roleData?.isSystem ? { background: '#f8fafc', color: '#64748b' } : {}}
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief explanation of duties and access level"
              />
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Permissions Matrix</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Selected: <strong>{form.permissions.length}</strong> permission(s)
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={selectAll}
                className="ghost"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="ghost"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {categories.map((cat, idx) => {
              const catIds = cat.permissions.map((p) => p.id);
              const allChecked = catIds.every((permId) => form.permissions.includes(permId));

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
                      {allChecked ? 'Deselect group' : 'Select group'}
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
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={updateMutation.isPending}
            style={{ padding: '10px 24px' }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Update Matrix'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
