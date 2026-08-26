'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '../../../../components/auth-guard';
import { api, money } from '../../../../lib/api';
import { useSiteSettings } from '../../../../hooks/use-site-settings';
import { CurrencyDisplay, DateDisplay, LoadingSpinner, ErrorState } from '../../../../components/ui';
import { Printer, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../../../provider';

export default function InvoicePrintPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const saleQuery = useQuery({
    queryKey: ['invoice-detail', id],
    queryFn: () => api<any>(`/sales/${id}`),
  });

  const { data: settings } = useSiteSettings();

  if (saleQuery.isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner label={t('common.loading')} />
      </div>
    );
  }

  if (saleQuery.error) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <ErrorState message={saleQuery.error.message} onRetry={() => saleQuery.refetch()} />
      </div>
    );
  }

  const s = saleQuery.data;
  const cfg = settings || {};

  const companyName = cfg.business_name || 'StockPilot Enterprise';
  const companyPhone = cfg.business_phone || '+880 2-9568000';
  const companyEmail = cfg.business_email || 'billing@company.com';
  const companyAddress = cfg.business_address || 'Dhaka, Bangladesh';
  const companyTaxId = cfg.business_tax_id;
  const logoUrl = cfg.business_logo;
  const termsText = cfg.invoice_terms || '1. Goods once sold cannot be returned without original cash receipt.\n2. Warranty claims are subject to inspection and manufacturer policy.';
  const footerNote = cfg.invoice_footer || 'Thank you for your business!';

  function handlePrint() {
    const invoiceEl = document.getElementById('printable-invoice-paper');
    if (!invoiceEl) {
      window.print();
      return;
    }

    const invoiceHtml = invoiceEl.innerHTML;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${s.invoiceNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: auto;
      margin: 12mm 15mm;
    }
    body {
      font-family: 'DM Sans', 'Hind Siliguri', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 12px;
    }
    .invoice-table th {
      background: #f8fafc;
      padding: 10px 12px;
      color: #475569;
      font-weight: 700;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }
    .invoice-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    tr {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${invoiceHtml}
</body>
</html>`;

    let iframe = document.getElementById('__invoice_print_frame__') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = '__invoice_print_frame__';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  }

  return (
    <AuthGuard>
      <div className="invoice-container">
        {/* Navigation & Print Actions Bar (hidden in print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link href={`/dashboard/sales/${id}`} className="ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Printer size={16} /> {t('common.export')}
          </button>
        </div>

        {/* Invoice Paper Card */}
        <div id="printable-invoice-paper" className="invoice-paper">
          {/* Header */}
          <div className="invoice-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={companyName}
                    style={{ maxHeight: 48, maxWidth: 180, objectFit: 'contain' }}
                  />
                ) : (
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      background: '#5068e6',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {companyName.substring(0, 2).toUpperCase()}
                  </span>
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>{companyName}</h2>
                  {companyTaxId && <small style={{ color: '#64748b' }}>BIN/Tax ID: {companyTaxId}</small>}
                </div>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                {companyAddress}<br />
                {t('common.phone')}: {companyPhone} · {t('common.email')}: {companyEmail}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h1 style={{ margin: 0, fontSize: 24, color: '#5068e6', textTransform: 'uppercase' }}>{t('sales.invoice_number')}</h1>
              <div style={{ marginTop: 6, fontSize: 13 }}>
                <strong>{t('sales.invoice_number')}:</strong> <code>{s.invoiceNumber}</code>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                <strong>{t('common.date')}:</strong> <DateDisplay value={s.saleDate} />
              </div>
              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: s.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                    color: s.paymentStatus === 'PAID' ? '#15803d' : '#b45309',
                  }}
                >
                  {t(`status.${s.paymentStatus?.toLowerCase()}`, { defaultValue: s.paymentStatus })}
                </span>
              </div>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

          {/* Customer & Payment Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{t('sales.customer')}:</span>
              <h3 style={{ margin: '4px 0', fontSize: 16 }}>{s.customer ? s.customer.name : t('common.walk_in_customer')}</h3>
              {s.customer && (
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  {s.customer.phone && <div>{t('common.phone')}: {s.customer.phone}</div>}
                  {s.customer.email && <div>{t('common.email')}: {s.customer.email}</div>}
                  {s.customer.address && <div>{t('common.address')}: {s.customer.address}</div>}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{t('common.payment_method')}:</span>
              <div style={{ marginTop: 4 }}>
                {t('common.payment_method')}: <strong>{t(`common.${s.paymentMethod?.toLowerCase()}`, { defaultValue: s.paymentMethod || t('common.cash') })}</strong>
              </div>
              <div>
                {t('common.status')}: <strong>{t(`status.${s.status?.toLowerCase()}`, { defaultValue: s.status })}</strong>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>{t('products.name')}</th>
                <th style={{ textAlign: 'center', width: 90 }}>{t('documents.qty')}</th>
                <th style={{ textAlign: 'right', width: 110 }}>{t('documents.unit_price')}</th>
                <th style={{ textAlign: 'right', width: 90 }}>{t('common.discount')}</th>
                <th style={{ textAlign: 'right', width: 90 }}>{t('common.tax')}</th>
                <th style={{ textAlign: 'right', width: 120 }}>{t('common.total')}</th>
              </tr>
            </thead>
            <tbody>
              {s.items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{item.product?.name || 'Item'}</strong>
                    {item.product?.sku && <span style={{ color: '#94a3b8', fontSize: 11 }}> ({item.product.sku})</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}><CurrencyDisplay value={item.unitPrice} /></td>
                  <td style={{ textAlign: 'right', color: Number(item.discount) > 0 ? '#16a34a' : 'inherit' }}>
                    <CurrencyDisplay value={item.discount} />
                  </td>
                  <td style={{ textAlign: 'right' }}><CurrencyDisplay value={item.tax} /></td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}><CurrencyDisplay value={item.total} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginTop: 24 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {s.notes && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{t('documents.internal_notes')}:</span>
                  <p style={{ margin: '4px 0', whiteSpace: 'pre-line' }}>{s.notes}</p>
                </div>
              )}
              <div>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{t('settings.invoice_settings')}:</span>
                <p style={{ margin: '4px 0', whiteSpace: 'pre-line', fontSize: 11, color: '#94a3b8' }}>
                  {termsText}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{t('common.subtotal')}:</span>
                <span><CurrencyDisplay value={s.subtotal} /></span>
              </div>
              {Number(s.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>{t('common.discount')}:</span>
                  <span>-<CurrencyDisplay value={s.discount} /></span>
                </div>
              )}
              {Number(s.tax) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('common.tax')}:</span>
                  <span>+<CurrencyDisplay value={s.tax} /></span>
                </div>
              )}
              {Number(s.shipping) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('documents.shipping_charge')}:</span>
                  <span>+<CurrencyDisplay value={s.shipping} /></span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#1e293b',
                  paddingTop: 8,
                  borderTop: '2px solid #e2e8f0',
                }}
              >
                <span>{t('sales.grand_total')}:</span>
                <span><CurrencyDisplay value={s.grandTotal} /></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                <span>{t('sales.paid_amount')}:</span>
                <span><CurrencyDisplay value={s.paidAmount} /></span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: 14,
                  color: Number(s.dueAmount) > 0 ? '#dc2626' : '#16a34a',
                  paddingTop: 4,
                  borderTop: '1px dashed #cbd5e1',
                }}
              >
                <span>{t('sales.due_amount')}:</span>
                <span><CurrencyDisplay value={s.dueAmount} /></span>
              </div>
            </div>
          </div>

          {/* Footer Note & Signature */}
          <div style={{ textAlign: 'center', margin: '32px 0 16px', fontSize: 12, fontWeight: 600, color: '#475569' }}>
            {footerNote}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 20, borderTop: '1px solid #e2e8f0', fontSize: 12, color: '#94a3b8' }}>
            <div>
              <div style={{ width: 140, borderTop: '1px solid #94a3b8', marginBottom: 4 }} />
              {t('documents.customer_signature', { defaultValue: 'Customer Signature' })}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: 140, borderTop: '1px solid #94a3b8', marginBottom: 4, marginLeft: 'auto' }} />
              {t('documents.authorized_signatory', { defaultValue: 'Authorized Signatory' })}
            </div>
          </div>
        </div>

        <style jsx global>{`
          .invoice-container {
            max-width: 850px;
            margin: 32px auto;
            padding: 0 16px;
          }
          .invoice-paper {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            font-size: 13px;
          }
          .invoice-table th {
            background: #f8fafc;
            padding: 10px 12px;
            color: #475569;
            font-weight: 700;
            border-bottom: 2px solid #e2e8f0;
          }
          .invoice-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .no-print, aside, header, nav {
              display: none !important;
            }
            .invoice-container {
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .invoice-paper {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
