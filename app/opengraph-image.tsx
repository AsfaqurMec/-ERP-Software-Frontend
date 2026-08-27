import { ImageResponse } from 'next/og';
import { getServerBrandSettings } from '../lib/server-settings';

export const runtime = 'nodejs';
export const revalidate = 0;
export const alt = 'HAMIM GROUP — Enterprise Management ERP';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const brand = await getServerBrandSettings();
  const businessName = brand.business_name || 'HAMIM GROUP';
  const logoUrl = brand.business_logo;

  let logoBase64: string | null = null;
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl, { cache: 'no-store' });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString('base64');
        const mime = res.headers.get('content-type') || 'image/png';
        logoBase64 = `data:${mime};base64,${base64}`;
      }
    } catch {
      // ignore
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, #0f172a 100%)',
          fontFamily: 'sans-serif',
          padding: '50px 60px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(99, 102, 241, 0) 70%)',
            top: '0px',
            left: '275px',
          }}
        />

        {/* Logo and Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '28px',
          }}
        >
          {logoBase64 ? (
            <img
              src={logoBase64}
              alt={businessName}
              width={140}
              height={140}
              style={{
                objectFit: 'contain',
                borderRadius: '10px',
                background: '#ffffff',
                padding: '8px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.28)',
                border: '2px solid rgba(255, 255, 255, 0.48)',
              }}
            />
          ) : (
            ""
            // <div
            //   style={{
            //     width: '100px',
            //     height: '100px',
            //     borderRadius: '24px',
            //     background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            //     display: 'flex',
            //     alignItems: 'center',
            //     justifyContent: 'center',
            //     color: '#ffffff',
            //     fontSize: '44px',
            //     fontWeight: 900,
            //     boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
            //     border: '2px solid rgba(255, 255, 255, 0.2)',
            //   }}
            // >
            //   {businessName.slice(0, 2).toUpperCase()}
            // </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1.5px',
                lineHeight: 1.1,
              }}
            >
              {businessName}
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#818cf8',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginTop: '6px',
              }}
            >
              Enterprise Management ERP
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '920px',
            lineHeight: 1.35,
            marginBottom: '36px',
          }}
        >
          Smart Inventory Control · POS Invoicing · Customer &amp; Supplier Dues
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
          }}
        >
          {['Live Stock Position', 'Customer Due Ledger', 'Supplier Payables', 'Multi-Lingual (বাংলা/EN)'].map(
            (badge) => (
              <div
                key={badge}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  color: '#cbd5e1',
                  fontSize: '17px',
                  fontWeight: 600,
                }}
              >
                {badge}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
