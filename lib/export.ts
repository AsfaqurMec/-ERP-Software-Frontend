/**
 * Universal export utilities for CSV, Excel, and Print/PDF.
 * Supports UTF-8 BOM encoding for seamless Microsoft Excel compatibility.
 */

export interface ExportColumn<T = any> {
  header: string;
  key: string;
  formatter?: (row: T) => string | number;
  format?: (value: any) => string | number;
}

function extractValue(row: any, key: string, formatter?: (r: any) => string | number, format?: (v: any) => string | number): string {
  if (formatter) {
    return String(formatter(row) ?? '');
  }
  const parts = key.split('.');
  let curr = row;
  for (const p of parts) {
    if (curr === null || curr === undefined) return '';
    curr = curr[p];
  }
  if (format) {
    return String(format(curr) ?? '');
  }
  return String(curr ?? '');
}

function escapeCsvCell(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function escapeHtml(unsafe: string): string {
  return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function exportToCsv<T = any>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
) {
  const headers = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => escapeCsvCell(extractValue(row, col.key, col.formatter, col.format)))
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel<T = any>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
) {
  // Generates clean HTML Spreadsheet XML format recognized natively by Microsoft Excel
  let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Sheet1">
  <Table>
   <Row>`;

  for (const col of columns) {
    xml += `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeHtml(col.header)}</Data></Cell>`;
  }
  xml += `</Row>`;

  for (const row of data) {
    xml += `<Row>`;
    for (const col of columns) {
      const val = extractValue(row, col.key, col.formatter, col.format);
      const isNum = !isNaN(Number(val)) && val.trim() !== '' && !val.startsWith('0') && !val.includes('-');
      xml += `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeHtml(val)}</Data></Cell>`;
    }
    xml += `</Row>`;
  }

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPrintOrPdf<T = any>(
  title: string,
  columns: ExportColumn<T>[],
  data: T[],
  subtitle?: string
) {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const headersHtml = columns
    .map(
      (c) =>
        `<th style="text-align: left; padding: 10px 12px; background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1;">${escapeHtml(
          c.header
        )}</th>`
    )
    .join('');

  const rowsHtml = data
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = columns
        .map((c) => {
          const val = extractValue(row, c.key, c.formatter, c.format);
          return `<td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 11.5px;">${escapeHtml(
            val
          )}</td>`;
        })
        .join('');
      return `<tr style="background: ${bg};">${cells}</tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: auto;
      margin: 12mm 14mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 2px solid #4f46e5;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 4px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    .meta-box strong {
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    tr {
      page-break-inside: avoid;
    }
    .report-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <h1 class="brand-title">${escapeHtml(title)}</h1>
      <p class="brand-sub">${escapeHtml(subtitle || 'StockPilot Management & Operations Ledger')}</p>
    </div>
    <div class="meta-box">
      <div>Generated: <strong>${dateStr} at ${timeStr}</strong></div>
      <div>Total Records: <strong>${data.length}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>${headersHtml}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="report-footer">
    <span>StockPilot Inventory & Sales Management System</span>
    <span>Confidential Business Data</span>
  </div>
</body>
</html>`;

  // Create or reuse hidden iframe
  let iframe = document.getElementById('__print_export_frame__') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = '__print_export_frame__';
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
    }, 300);
  }
}

export function triggerPrint() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
