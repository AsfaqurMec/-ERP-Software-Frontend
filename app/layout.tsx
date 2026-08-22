import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'StockPilot — Enterprise Inventory, Sales & POS Management System',
    template: '%s | StockPilot',
  },
  description:
    'All-in-one inventory management, sales invoicing, point-of-sale (POS), procurement, multi-lingual support, and comprehensive customer & supplier due ledgers for modern businesses.',
  keywords: [
    'Inventory Management',
    'Sales Invoicing',
    'POS Software',
    'Stock Control',
    'Customer Due Ledger',
    'Supplier Payable',
    'Business ERP',
    'StockPilot',
  ],
  authors: [{ name: 'StockPilot Team' }],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'StockPilot — Smart Inventory & Sales Management ERP',
    description:
      'Real-time inventory control, POS invoicing, purchase automation, customer & supplier due ledgers, and multi-lingual support.',
    type: 'website',
    siteName: 'StockPilot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockPilot — Smart Inventory & Sales Management ERP',
    description:
      'Real-time inventory control, POS invoicing, purchase automation, customer & supplier due ledgers, and multi-lingual support.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
