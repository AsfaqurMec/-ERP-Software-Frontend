import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import { getServerBrandSettings } from '../lib/server-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hamim-group-erp.vercel.app';

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getServerBrandSettings();
  const businessName = brand.business_name || 'HAMIM GROUP';
  const logoUrl = brand.business_logo || 'https://res.cloudinary.com/dzmglrehf/image/upload/v1787417330/stockpilot/branding/ux8pimioeqtb1ofb01jw.png';

  const title = `${businessName} — Enterprise Operations & Sales ERP`;
  const description = `${businessName} management portal. Real-time inventory control, POS invoicing, purchase automation, and customer & supplier due ledgers.`;

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: title,
      template: `%s | ${businessName}`,
    },
    description,
    keywords: [
      businessName,
      'HAMIM GROUP',
      'Inventory Management',
      'Sales Invoicing',
      'POS Software',
      'Stock Control',
      'Customer Due Ledger',
      'Supplier Payable',
      'ERP Bangladesh',
    ],
    authors: [{ name: businessName }],
    icons: {
      icon: [
        { url: logoUrl, type: 'image/png' },
        { url: '/icon', type: 'image/png', sizes: '64x64' },
      ],
      shortcut: logoUrl,
      apple: logoUrl,
    },
    openGraph: {
      title,
      description,
      url: appUrl,
      siteName: businessName,
      images: [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: `${businessName} Logo`,
        },
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${businessName} — Enterprise ERP`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [logoUrl, '/opengraph-image'],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getServerBrandSettings();
  const logoUrl = brand.business_logo || 'https://res.cloudinary.com/dzmglrehf/image/upload/v1787417330/stockpilot/branding/ux8pimioeqtb1ofb01jw.png';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={logoUrl} type="image/png" />
        <link rel="shortcut icon" href={logoUrl} type="image/png" />
        <link rel="apple-touch-icon" href={logoUrl} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
