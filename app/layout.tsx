import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { getServerBrandSettings } from '../lib/server-settings';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hamim-group-erp.vercel.app';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getServerBrandSettings();
  const businessName = brand.business_name || 'StockPilot';
  const logoUrl = brand.business_logo;

  const title = `${businessName} — Enterprise Inventory, Sales & POS Management System`;
  const description = `${businessName} management portal. Real-time inventory control, POS invoicing, purchase automation, customer & supplier due ledgers, and multi-lingual operations.`;

  const ogImages = logoUrl
    ? [
        {
          url: logoUrl,
          alt: `${businessName} Logo`,
        },
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${businessName} — Enterprise ERP`,
        },
      ]
    : [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${businessName} — Enterprise ERP`,
        },
      ];

  const iconList = logoUrl
    ? [
        { url: logoUrl },
        { url: '/icon', type: 'image/png', sizes: '64x64' },
      ]
    : [
        { url: '/icon', type: 'image/png', sizes: '64x64' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ];

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: title,
      template: `%s | ${businessName}`,
    },
    description,
    keywords: [
      businessName,
      'Inventory Management',
      'Sales Invoicing',
      'POS Software',
      'Stock Control',
      'Customer Due Ledger',
      'Supplier Payable',
      'Business ERP',
    ],
    authors: [{ name: businessName }],
    icons: {
      icon: iconList,
      shortcut: logoUrl || '/icon',
      apple: logoUrl || '/apple-icon',
    },
    openGraph: {
      title,
      description,
      url: appUrl,
      siteName: businessName,
      images: ogImages,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logoUrl || '/opengraph-image'],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getServerBrandSettings();
  const logoUrl = brand.business_logo;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {logoUrl ? (
          <>
            <link rel="icon" href={logoUrl} />
            <link rel="shortcut icon" href={logoUrl} />
            <link rel="apple-touch-icon" href={logoUrl} />
          </>
        ) : (
          <>
            <link rel="icon" href="/icon" sizes="64x64" type="image/png" />
            <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" type="image/png" />
          </>
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
