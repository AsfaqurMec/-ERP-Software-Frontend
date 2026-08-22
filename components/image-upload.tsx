'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import { api } from '../lib/api';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  description?: string;
  aspectRatio?: 'square' | 'wide' | 'avatar';
  rounded?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'products',
  label = 'Product Image',
  description,
  aspectRatio = 'square',
  rounded = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAvatar = aspectRatio === 'avatar';

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large (maximum size is 10MB).');
      return;
    }

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api<{ url: string; publicId?: string }>('/upload/image', {
          method: 'POST',
          body: JSON.stringify({ file: base64, folder }),
        });

        if (res && res.url) {
          onChange(res.url);
        } else {
          throw new Error('Upload succeeded but no URL was returned');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to upload image to Cloudinary.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setError('Failed to read file from device.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange('');
    setError(null);
  }

  if (isAvatar) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && <label style={{ fontSize: 12, fontWeight: 700, color: '#50586d' }}>{label}</label>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            {value ? (
              <img
                src={value}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#94a3b8',
                  border: '2px dashed #cbd5e1',
                }}
              >
                <Camera size={24} />
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: '#4f46e5',
                color: '#ffffff',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                border: '2px solid #ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                padding: 0,
              }}
              title="Upload photo"
            >
              {uploading ? <Loader2 size={12} className="spin" /> : <Upload size={12} />}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                {uploading ? 'Uploading…' : value ? 'Change Photo' : 'Upload Photo'}
              </button>

              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              JPG, PNG, WebP up to 10MB (Stored on Cloudinary)
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 700, color: '#50586d' }}>{label}</label>}

      {value ? (
        <div
          style={{
            position: 'relative',
            width: aspectRatio === 'wide' ? '100%' : 160,
            height: aspectRatio === 'wide' ? 140 : 160,
            borderRadius: rounded ? '50%' : 8,
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={value}
            alt={label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                background: '#ffffff',
                color: '#1e293b',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 8,
            padding: '24px 16px',
            textAlign: 'center',
            background: '#f8fafc',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'border-color 0.15s ease, background 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
        >
          {uploading ? (
            <>
              <Loader2 className="spin" size={28} color="#4f46e5" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>
                Uploading to Cloudinary…
              </span>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#4f46e5',
                }}
              >
                <Upload size={20} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                  Click to upload or drag and drop
                </span>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                  {description || 'PNG, JPG, WebP up to 10MB (Instant Cloudinary CDN)'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
    </div>
  );
}
