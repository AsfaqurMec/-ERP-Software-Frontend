'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../../lib/api';
import { PageContainer, PageHeader } from '../../../../../components/ui';
import { User, Camera, Shield, Key, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../../../../hooks/use-auth';

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = usePermissions();

  const { data: rolesData } = useQuery<{ items: any[] }>({
    queryKey: ['roles'],
    queryFn: () => api('/roles'),
  });

  const { data: user, isLoading } = useQuery<any>({
    queryKey: ['user', id],
    queryFn: () => api(`/users/${id}`),
    enabled: Boolean(id),
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    status: 'ACTIVE',
    avatar: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        roleId: user.roleId || '',
        status: user.status || 'ACTIVE',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      router.push('/dashboard/users');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update user account');
    },
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const uploadRes = await api('/upload/image', {
          method: 'POST',
          body: JSON.stringify({ file: base64, folder: 'avatars' }),
        });
        setForm((prev) => ({ ...prev, avatar: uploadRes.url }));
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to process avatar');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      setErrorMsg('Name and email are required');
      return;
    }
    if (form.password && form.password.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }

    const payload: any = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatar: form.avatar,
      roleId: form.roleId || undefined,
      status: form.status,
    };

    if (form.password) {
      payload.password = form.password;
    }

    updateMutation.mutate(payload);
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="skeleton" style={{ height: 300 }}>
          Loading user details...
        </div>
      </PageContainer>
    );
  }

  const isSelf = currentUser?.id === user?.id;

  return (
    <PageContainer>
      <PageHeader
        title={`Edit User: ${user?.name}`}
        description="Update contact information, reassign security roles, or reset account password."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users Directory', href: '/dashboard/users' },
          { label: 'Edit User' },
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
        <div className="card" style={{ padding: 28 }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={form.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #e0e7ff',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                  }}
                >
                  <User size={32} />
                </div>
              )}
              <label
                htmlFor="edit-avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: '#4f46e5',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
                title="Change Avatar"
              >
                <Camera size={14} />
              </label>
              <input
                id="edit-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />
            </div>

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{form.name || 'User Profile'}</div>
              <small style={{ color: '#64748b' }}>Cloudinary hosted profile picture.</small>
              {uploadingImage && <small style={{ color: '#6366f1', display: 'block' }}>Uploading photo...</small>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="form-field">
              <label>Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+880 1700-000000"
              />
            </div>

            <div className="form-field">
              <label>Reset Password (Leave blank to keep unchanged)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter new password if changing"
              />
            </div>

            <div className="form-field">
              <label>Assigned Security Role</label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              >
                <option value="">Default Admin</option>
                {rolesData?.items.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSystem ? '(System)' : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Account Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={isSelf}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive (Locked)</option>
              </select>
              {isSelf && <small style={{ color: '#64748b' }}>You cannot deactivate your own session</small>}
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={() => router.push('/dashboard/users')} className="ghost">
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={updateMutation.isPending}
            style={{ padding: '10px 24px' }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save User Changes'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
