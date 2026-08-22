import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hamim-group-erp.vercel.app';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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
    icon: [
      { url: '/icon', type: 'image/png', sizes: '64x64' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon',
    apple: '/apple-icon',
  },
  openGraph: {
    title: 'StockPilot — Smart Inventory & Sales Management ERP',
    description:
      'Real-time inventory control, POS invoicing, purchase automation, customer & supplier due ledgers, and multi-lingual support.',
    url: appUrl,
    siteName: 'StockPilot',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'StockPilot — Smart Inventory & Sales Management ERP',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockPilot — Smart Inventory & Sales Management ERP',
    description:
      'Real-time inventory control, POS invoicing, purchase automation, customer & supplier due ledgers, and multi-lingual support.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon" sizes="64x64" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" type="image/png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
