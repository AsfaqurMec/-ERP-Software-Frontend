'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, money } from '../lib/api';
import { LoadingSpinner } from './ui';
import { Sparkles, UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface ScannedItem {
  rawName: string;
  rawSku?: string;
  quantity: number;
  unitCost: number;
  discount: number;
  tax: number;
  total: number;
  matchedProductId: string | null;
  matchedProductName: string | null;
  matchedSku: string | null;
  matchConfidence: number;
  isNewProduct: boolean;
}

interface ScanResult {
  supplierName: string | null;
  matchedSupplierId: string | null;
  invoiceNumber: string | null;
  invoiceDate: string;
  items: ScannedItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  extractionMethod: string;
  notes?: string;
}

export function AIBillScannerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Clean = result.split(',')[1];
      setFileBase64(base64Clean);
    };
    reader.readAsDataURL(file);
  };

  const executeScan = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const res = await api<ScanResult>('/purchases/scan-invoice', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: fileBase64 || undefined,
          mimeType: mimeType || undefined,
          textContent: textInput.trim() || undefined,
        }),
      });

      setScanResult(res);
    } catch (err: any) {
      setError(err?.message || 'Invoice extraction failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const applyToPurchaseForm = () => {
    if (!scanResult) return;
    sessionStorage.setItem('scanned_invoice_data', JSON.stringify(scanResult));
    onClose();
    router.push('/dashboard/purchases/create');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                AI Bill & Supplier Invoice Scanner
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Upload a bill photo or paste text to auto-match SKUs and pre-populate your purchase order.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {!scanResult ? (
            <>
              {/* Tab Selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: 0,
                    background: activeTab === 'upload' ? '#e0e7ff' : 'transparent',
                    color: activeTab === 'upload' ? '#4338ca' : '#64748b',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <UploadCloud size={16} /> Upload Bill Photo / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: 0,
                    background: activeTab === 'text' ? '#e0e7ff' : 'transparent',
                    color: activeTab === 'text' ? '#4338ca' : '#64748b',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={16} /> Paste Invoice Text / Items
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: 32,
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    id="invoice-file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="invoice-file-input" style={{ cursor: 'pointer' }}>
                    <UploadCloud size={40} style={{ color: '#6366f1', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      {fileName ? `Selected: ${fileName}` : 'Click to select bill photo, receipt or PDF'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>PNG, JPG, WEBP, or PDF up to 10MB</div>
                  </label>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={6}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste invoice text, memo items, or structured text here:&#10;e.g.&#10;Supplier: Apex Distribution&#10;Wireless Mouse, 10 pcs, 350&#10;USB Keyboard, 5 pcs, 650"
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              )}

              {error && (
                <div style={{ marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeScan}
                  disabled={isScanning || (!fileBase64 && !textInput.trim())}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 0,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: isScanning || (!fileBase64 && !textInput.trim()) ? 'not-allowed' : 'pointer',
                    opacity: isScanning || (!fileBase64 && !textInput.trim()) ? 0.6 : 1,
                  }}
                >
                  {isScanning ? (
                    <>
                      <LoadingSpinner size="sm" /> Analyzing & Matching SKUs…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Scan & Match SKUs
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div>
              {/* Scan Results View */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                    Extraction Succeeded via {scanResult.extractionMethod}
                  </div>
                  <div style={{ fontSize: 12, color: '#15803d' }}>
                    Supplier: <strong>{scanResult.supplierName || 'Not specified'}</strong>{' '}
                    {scanResult.matchedSupplierId ? '(🟢 Matched in DB)' : '(⚪ New Supplier)'} · Date:{' '}
                    <strong>{scanResult.invoiceDate}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#15803d' }}>Grand Total</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#166534' }}>
                    {money(scanResult.grandTotal)}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Scanned Item</th>
                      <th style={{ padding: '8px 12px' }}>Matched DB Product</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cost</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.rawName}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {item.matchedProductName ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                background: '#dcfce7',
                                color: '#15803d',
                              }}
                            >
                              <CheckCircle2 size={12} /> {item.matchedProductName} ({item.matchedSku})
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                background: '#fef3c7',
                                color: '#92400e',
                              }}
                            >
                              <AlertTriangle size={12} /> New SKU (Will be created)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{money(item.unitCost)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                          {money(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Scan Another Bill
                </button>
                <button
                  type="button"
                  onClick={applyToPurchaseForm}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 0,
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Populate Purchase Form <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
