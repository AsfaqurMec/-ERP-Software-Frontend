import { ImageResponse } from 'next/og';
import { getServerBrandSettings } from '../lib/server-settings';

export const runtime = 'nodejs';
export const revalidate = 30;
export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default async function Icon() {
  const brand = await getServerBrandSettings();
  const businessName = brand.business_name || 'StockPilot';
  const logoUrl = brand.business_logo;

  if (logoUrl) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '4px',
          }}
        >
          <img
            src={logoUrl}
            alt={businessName}
            width={56}
            height={56}
            style={{
              objectFit: 'contain',
              borderRadius: '10px',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const initials = businessName.slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          borderRadius: '14px',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '28px',
          fontFamily: 'sans-serif',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
        }}
      >
        {initials}
      </div>
    ),
    {
      ...size,
    }
  );
}
