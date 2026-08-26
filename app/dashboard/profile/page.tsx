'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { PageContainer, PageHeader } from '../../../components/ui';
import { User, Shield, Key, Camera, Check, AlertCircle, Clock, Calendar, Mail, Phone } from 'lucide-react';
import { useTranslation } from '../../../provider';

export default function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['profile'],
    queryFn: () => api('/profile'),
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      // Update local storage user session name/avatar
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: res.name, avatar: res.avatar }));
        }
      } catch {}
      setTimeout(() => setProfileMsg(null), 4000);
    },
    onError: (err: any) => {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) =>
      api('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      }),
    onSuccess: () => {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(null), 4000);
    },
    onError: (err: any) => {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
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
        setProfileMsg({ type: 'success', text: 'Avatar uploaded. Click "Save Changes" to apply.' });
      } catch (err: any) {
        setProfileMsg({ type: 'error', text: err.message || 'Avatar upload failed' });
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    updateProfileMutation.mutate(form);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="skeleton" style={{ height: 300 }}>
          {t('common.loading')}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('nav.my_profile')}
        description={t('users.description')}
        breadcrumbs={[
          { label: t('common.dashboard'), href: '/dashboard' },
          { label: t('settings.title'), href: '/dashboard/settings' },
          { label: t('nav.my_profile') },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{t('nav.my_profile')}</h3>
          </div>

          {profileMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 18,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: profileMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: profileMsg.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${profileMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {profileMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={form.name}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #e0e7ff',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  }}
                >
                  {form.name ? form.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
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
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{form.name || t('users.user')}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span className="pill" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                  {profile?.roleName || profile?.role || 'Admin'}
                </span>
                <span className={`pill ${profile?.status === 'ACTIVE' ? 'success' : ''}`}>
                  {profile?.status === 'ACTIVE' ? t('status.active') : profile?.status || t('status.active')}
                </span>
              </div>
              {uploadingImage && <small style={{ color: '#6366f1', display: 'block', marginTop: 4 }}>{t('common.loading')}</small>}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 16 }}>
            <div className="form-field">
              <label>{t('users.user_name')} *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder={t('users.user_name')}
              />
            </div>

            <div className="form-field">
              <label>{t('common.email')} *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder={t('common.email')}
              />
            </div>

            <div className="form-field">
              <label>{t('common.phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+880 1700-000000"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field">
                <label>{t('users.role')}</label>
                <input
                  type="text"
                  value={profile?.roleName || profile?.role || 'Admin'}
                  disabled
                  style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-field">
                <label>{t('common.status')}</label>
                <input
                  type="text"
                  value={profile?.status === 'ACTIVE' ? t('status.active') : profile?.status || t('status.active')}
                  disabled
                  style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Account Timestamps */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} />
                <span>{t('common.date')}: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={13} />
                <span>{t('users.last_active')}: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Just now'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="submit"
                className="primary-button"
                disabled={updateProfileMutation.isPending}
                style={{ padding: '10px 22px' }}
              >
                {updateProfileMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Key size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{t('settings.admin_password')}</h3>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 18px' }}>
            {t('settings.admin_password_desc')}
          </p>

          {passwordMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 18,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: passwordMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: passwordMsg.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${passwordMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: 16 }}>
            <div className="form-field">
              <label>{t('settings.current_password')} *</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                placeholder={t('settings.current_password')}
              />
            </div>

            <div className="form-field">
              <label>{t('settings.new_password')} *</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                placeholder={t('settings.new_password')}
              />
            </div>

            <div className="form-field">
              <label>{t('settings.confirm_password')} *</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                placeholder={t('settings.confirm_password')}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="submit"
                className="primary-button"
                disabled={changePasswordMutation.isPending}
                style={{ padding: '10px 22px', background: '#4338ca' }}
              >
                {changePasswordMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
