'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { PageContainer, PageHeader } from '../../../../components/ui';
import { User, Camera, Shield, AlertCircle } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: rolesData } = useQuery<{ items: any[] }>({
    queryKey: ['roles'],
    queryFn: () => api('/roles'),
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

  const createMutation = useMutation({
    mutationFn: (data: any) => api('/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/dashboard/users');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create user account');
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
    if (!form.name || !form.email || !form.password) {
      setErrorMsg('Name, email, and initial password are required');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    createMutation.mutate(form);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Add New User"
        description="Register a new employee account and assign their initial authorization role."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users Directory', href: '/dashboard/users' },
          { label: 'Create User' },
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
                htmlFor="create-avatar-upload"
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
                title="Upload Avatar"
              >
                <Camera size={14} />
              </label>
              <input
                id="create-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />
            </div>

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Profile Picture (Optional)</div>
              <small style={{ color: '#64748b' }}>PNG, JPG or WebP image. Cloudinary hosted.</small>
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
                placeholder="e.g. Tanvir Ahmed"
              />
            </div>

            <div className="form-field">
              <label>Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="name@company.com"
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
              <label>Initial Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="form-field">
              <label>Assigned Security Role *</label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                required
              >
                <option value="">Select a role...</option>
                {rolesData?.items.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSystem ? '(System)' : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Initial Account Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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
            disabled={createMutation.isPending}
            style={{ padding: '10px 24px' }}
          >
            {createMutation.isPending ? 'Creating...' : 'Create User Account'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
