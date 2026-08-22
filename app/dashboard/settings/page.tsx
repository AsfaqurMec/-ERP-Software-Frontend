'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Check,
  CreditCard,
  FileText,
  KeyRound,
  Lock,
  Package,
  Save,
  Shield,
  Smartphone,
  Upload,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Phone,
  Hash,
  MapPin,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AuthGuard } from '../../../components/auth-guard';
import { Shell } from '../../../components/shell';
import { PageContainer, PageHeader } from '../../../components/ui';
import { api } from '../../../lib/api';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'BUSINESS' | 'INVOICE' | 'INVENTORY' | 'PAYMENT' | 'SECURITY'>('BUSINESS');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<Record<string, string>>('/settings'),
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, string>) =>
      api('/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      setSavedSuccess(true);
      setErrorMessage('');
      setTimeout(() => setSavedSuccess(false), 3500);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update settings');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      api('/settings/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    onSuccess: () => {
      setPasswordMsg({ type: 'success', text: 'Administrative password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    },
    onError: (err: any) => {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
    },
  });

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(formData);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo image file must be smaller than 5MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api<{ url: string }>('/upload/image', {
            method: 'POST',
            body: JSON.stringify({
              image: base64Data,
              folder: 'stockpilot/branding',
            }),
          });
          handleChange('business_logo', res.url || base64Data);
        } catch {
          handleChange('business_logo', base64Data);
        } finally {
          setUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingLogo(false);
      setErrorMessage('Failed to read image file.');
    }
  }

  function handleRemoveLogo() {
    handleChange('business_logo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    passwordMutation.mutate();
  }

  const tabs = [
    { id: 'BUSINESS', label: 'Business Profile & Logo', icon: Building2, desc: 'Brand identity & contact information' },
    { id: 'INVOICE', label: 'Invoices & Receipts', icon: FileText, desc: 'Numbering formats, terms & disclosures' },
    { id: 'INVENTORY', label: 'Inventory Rules', icon: Package, desc: 'Stock policies & alert thresholds' },
    { id: 'PAYMENT', label: 'Payment Methods', icon: CreditCard, desc: 'Enabled payment channels & gateways' },
    { id: 'SECURITY', label: 'Account & Security', icon: Lock, desc: 'Admin password & credentials' },
  ] as const;

  const currentTabInfo = tabs.find((t) => t.id === activeTab)!;

  return (
    <AuthGuard>
      <Shell>
        <PageContainer>
          <PageHeader
            title="System Settings"
            description="Configure enterprise brand identity, custom logo, invoice rules, inventory controls, and security policies"
            breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
          />

          {savedSuccess && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '12px 18px',
                borderRadius: 10,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.9rem',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
              }}
            >
              <Check size={18} color="#16a34a" />
              <span>Settings updated and saved successfully across all application modules!</span>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '12px 18px',
                borderRadius: 10,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
              }}
            >
              <AlertCircle size={18} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
            {/* Settings Sidebar Navigation */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' }}>
                  Preferences & Config
                </span>
              </div>
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveTab(id);
                      setErrorMessage('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 600 : 500,
                      background: isActive ? '#f0f4ff' : 'transparent',
                      color: isActive ? '#3b82f6' : '#475569',
                      border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: isActive ? '#3b82f6' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span style={{ flex: 1 }}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Settings Content Area */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '28px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {isLoading ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }} />
                  <span>Loading configuration profiles...</span>
                </div>
              ) : (
                <form onSubmit={handleSave}>
                  {/* TAB 1: BUSINESS SETTINGS & SITE LOGO */}
                  {activeTab === 'BUSINESS' && (
                    <div>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                          Business Profile & Brand Identity
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                          Configure your official company identity, logo branding, and contact details shown on printed invoices, POS slips, and reports.
                        </p>
                      </div>

                      {/* Site Logo Section */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 10,
                          padding: '20px',
                          marginBottom: 26,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <ImageIcon size={18} color="#3b82f6" />
                          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b' }}>
                            Site & Company Logo
                          </span>
                        </div>
                        <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
                          Upload your organization's official logo. It appears on the sidebar, header branding, customer sales invoices, and exported PDF documents.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                          {/* Logo Preview Container */}
                          <div
                            style={{
                              width: 180,
                              height: 70,
                              borderRadius: 8,
                              border: '1px dashed #cbd5e1',
                              background: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 8,
                              overflow: 'hidden',
                              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                            }}
                          >
                            {formData.business_logo ? (
                              <img
                                src={formData.business_logo}
                                alt="Site Logo Preview"
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <ImageIcon size={22} style={{ margin: '0 auto 2px', display: 'block', opacity: 0.6 }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>No Logo Uploaded</span>
                              </div>
                            )}
                          </div>

                          {/* Upload Actions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                onChange={handleLogoUpload}
                                style={{ display: 'none' }}
                                id="site-logo-input"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingLogo}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '8px 14px',
                                  borderRadius: 6,
                                  background: '#3b82f6',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.84rem',
                                  fontWeight: 600,
                                  cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Upload size={14} />
                                <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                              </button>

                              {formData.business_logo && (
                                <button
                                  type="button"
                                  onClick={handleRemoveLogo}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    color: '#ef4444',
                                    border: '1px solid #fecaca',
                                    fontSize: '0.84rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              Recommended format: PNG or SVG with transparent background (Max 5MB).
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Business Information Fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={14} color="#64748b" />
                            <span>Business / Store Name *</span>
                          </label>
                          <input
                            type="text"
                            value={formData.business_name || ''}
                            onChange={(e) => handleChange('business_name', e.target.value)}
                            placeholder="e.g. Acme Enterprise Ltd."
                            required
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={14} color="#64748b" />
                            <span>Official Phone Number</span>
                          </label>
                          <input
                            type="text"
                            value={formData.business_phone || ''}
                            onChange={(e) => handleChange('business_phone', e.target.value)}
                            placeholder="e.g. +880 1712-345678"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mail size={14} color="#64748b" />
                            <span>Official Email Address</span>
                          </label>
                          <input
                            type="email"
                            value={formData.business_email || ''}
                            onChange={(e) => handleChange('business_email', e.target.value)}
                            placeholder="contact@company.com"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Globe size={14} color="#64748b" />
                            <span>Official Website URL</span>
                          </label>
                          <input
                            type="url"
                            value={formData.business_website || ''}
                            onChange={(e) => handleChange('business_website', e.target.value)}
                            placeholder="https://www.company.com"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Hash size={14} color="#64748b" />
                            <span>Tax ID / BIN / VAT Number</span>
                          </label>
                          <input
                            type="text"
                            value={formData.business_tax_id || ''}
                            onChange={(e) => handleChange('business_tax_id', e.target.value)}
                            placeholder="e.g. BIN-00123984-702"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DollarSign size={14} color="#64748b" />
                            <span>Currency Symbol</span>
                          </label>
                          <input
                            type="text"
                            value={formData.currency_symbol || '৳'}
                            onChange={(e) => handleChange('currency_symbol', e.target.value)}
                            placeholder="৳, $, €, £, ₹"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={14} color="#64748b" />
                            <span>Registered Physical Address</span>
                          </label>
                          <textarea
                            rows={3}
                            value={formData.business_address || ''}
                            onChange={(e) => handleChange('business_address', e.target.value)}
                            placeholder="Street, City, State, Postal Code, Country"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              color: '#0f172a',
                              background: '#ffffff',
                              outline: 'none',
                              resize: 'vertical',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: INVOICES & RECEIPT FORMATTING */}
                  {activeTab === 'INVOICE' && (
                    <div>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                          Invoices & Receipt Formatting
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                          Customize sales invoice prefixes, sequential formats, return terms, and receipt footer notes.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Invoice Number Prefix
                          </label>
                          <input
                            type="text"
                            value={formData.invoice_prefix || 'INV-'}
                            onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                            placeholder="INV-, SAL-, POS-"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Prepended to every newly generated customer invoice.
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Number Formatting Scheme
                          </label>
                          <select
                            value={formData.invoice_number_format || 'PREFIX-SERIAL'}
                            onChange={(e) => handleChange('invoice_number_format', e.target.value)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                              background: '#ffffff',
                            }}
                          >
                            <option value="PREFIX-SERIAL">Prefix + Sequential Number (INV-000101)</option>
                            <option value="PREFIX-YEAR-SERIAL">Prefix + Year + Serial (INV-2026-000101)</option>
                          </select>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Controls sequential invoice counter style.
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Default Sales Tax / VAT (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.invoice_default_tax || '0'}
                            onChange={(e) => handleChange('invoice_default_tax', e.target.value)}
                            placeholder="0"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Applied automatically to new sales orders.
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Invoice Footer Note
                          </label>
                          <input
                            type="text"
                            value={formData.invoice_footer || ''}
                            onChange={(e) => handleChange('invoice_footer', e.target.value)}
                            placeholder="e.g. Thank you for doing business with us!"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Printed at the bottom of customer receipts.
                          </span>
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Standard Terms & Return Policy
                          </label>
                          <textarea
                            rows={3}
                            value={formData.invoice_terms || ''}
                            onChange={(e) => handleChange('invoice_terms', e.target.value)}
                            placeholder="1. Goods once sold cannot be returned without original invoice. 2. Warranty claims must be made within 7 days."
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                              resize: 'vertical',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INVENTORY & STOCK CONTROLS */}
                  {activeTab === 'INVENTORY' && (
                    <div>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                          Inventory & Warehouse Stock Rules
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                          Configure automated stock alert thresholds, measurement units, and negative stock enforcement.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Default Unit of Measure
                          </label>
                          <input
                            type="text"
                            value={formData.inventory_default_unit || 'Piece'}
                            onChange={(e) => handleChange('inventory_default_unit', e.target.value)}
                            placeholder="Piece, Box, Kg, Liter, Meter"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Default pre-selected unit when creating new items.
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Default Low Stock Threshold (Units)
                          </label>
                          <input
                            type="number"
                            value={formData.inventory_alert_threshold || '10'}
                            onChange={(e) => handleChange('inventory_alert_threshold', e.target.value)}
                            placeholder="10"
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Triggers automated low stock alerts and notification warnings.
                          </span>
                        </div>

                        <div
                          style={{
                            gridColumn: 'span 2',
                            padding: '18px 20px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 14,
                          }}
                        >
                          <input
                            type="checkbox"
                            id="negative-stock-check"
                            checked={formData.inventory_negative_stock === 'true'}
                            onChange={(e) =>
                              handleChange('inventory_negative_stock', e.target.checked ? 'true' : 'false')
                            }
                            style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
                          />
                          <div>
                            <label
                              htmlFor="negative-stock-check"
                              style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1e293b', cursor: 'pointer' }}
                            >
                              Allow Negative Inventory Stock Balance
                            </label>
                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                              Strictly disabled by default to maintain ledger accuracy. When unchecked, sales orders exceeding current on-hand warehouse stock will be prevented.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PAYMENT GATEWAY & METHODS */}
                  {activeTab === 'PAYMENT' && (
                    <div>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                          Accepted Payment Channels
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                          Enable or disable settlement payment channels accepted across sales invoices, purchase orders, and payment vouchers.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                          { key: 'payment_method_cash', label: 'Cash in Hand (Counter Collections & Cash Drawer)', desc: 'Physical cash settlements at POS counters' },
                          { key: 'payment_method_bank', label: 'Bank Transfer / Wire / Corporate Cheque', desc: 'Direct electronic bank ledger settlements' },
                          { key: 'payment_method_bkash', label: 'bKash Mobile Financial Services (MFS)', desc: 'Direct merchant payment via bKash personal or merchant account' },
                          { key: 'payment_method_nagad', label: 'Nagad Mobile Financial Services (MFS)', desc: 'Postal network digital financial payments' },
                          { key: 'payment_method_card', label: 'Credit / Debit Cards (POS / Visa / Mastercard)', desc: 'Electronic chip & swipe terminal payments' },
                        ].map(({ key, label, desc }) => {
                          const isChecked = formData[key] !== 'false';
                          return (
                            <label
                              key={key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '14px 18px',
                                borderRadius: 10,
                                border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                background: isChecked ? '#f8faff' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleChange(key, e.target.checked ? 'true' : 'false')}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isChecked ? '#1e293b' : '#64748b' }}>
                                  {label}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                  {desc}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: SECURITY & ADMIN CREDENTIALS */}
                  {activeTab === 'SECURITY' && (
                    <div>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                          Account & Administrative Security
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                          Update your current administrator password and review account authorization credentials.
                        </p>
                      </div>

                      {passwordMsg && (
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            marginBottom: 20,
                            fontSize: '0.88rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: passwordMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                            color: passwordMsg.type === 'error' ? '#991b1b' : '#166534',
                            border: passwordMsg.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
                          }}
                        >
                          {passwordMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                          <span>{passwordMsg.text}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 440 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Current Password *
                          </label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter your current password"
                              style={{
                                width: '100%',
                                padding: '10px 40px 10px 14px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword((prev) => !prev)}
                              style={{
                                position: 'absolute',
                                right: 10,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                              }}
                            >
                              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            New Password *
                          </label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="At least 8 characters"
                              style={{
                                width: '100%',
                                padding: '10px 40px 10px 14px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((prev) => !prev)}
                              style={{
                                position: 'absolute',
                                right: 10,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                              }}
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>
                            Confirm New Password *
                          </label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat new password"
                              style={{
                                width: '100%',
                                padding: '10px 40px 10px 14px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              style={{
                                position: 'absolute',
                                right: 10,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                              }}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handlePasswordSubmit}
                          disabled={passwordMutation.isPending || !currentPassword || !newPassword}
                          style={{
                            marginTop: 10,
                            padding: '10px 18px',
                            borderRadius: 8,
                            background: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: passwordMutation.isPending ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          <KeyRound size={16} />
                          <span>{passwordMutation.isPending ? 'Updating...' : 'Update Password'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Footer for config tabs */}
                  {activeTab !== 'SECURITY' && (
                    <div
                      style={{
                        marginTop: 32,
                        paddingTop: 20,
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                      }}
                    >
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '11px 24px',
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          border: 'none',
                          cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                          opacity: updateMutation.isPending ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                        }}
                      >
                        <Save size={16} />
                        <span>{updateMutation.isPending ? 'Saving Configuration...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </PageContainer>
      </Shell>
    </AuthGuard>
  );
}
