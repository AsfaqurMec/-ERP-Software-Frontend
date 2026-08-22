import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'StockPilot — Enterprise Inventory & Sales Management System';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          background: 'radial-gradient(circle at 20% 20%, #312e81 0%, #0f172a 100%)',
          fontFamily: 'sans-serif',
          padding: '60px',
          boxSizing: 'border-box',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            top: '15px',
            left: '300px',
          }}
        />

        {/* Brand Icon & Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '48px',
              fontWeight: 900,
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            SP
          </div>
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
              }}
            >
              StockPilot
            </span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#818cf8',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Enterprise Operations ERP
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '30px',
            fontWeight: 700,
            color: '#e2e8f0',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.35,
            marginBottom: '40px',
          }}
        >
          Smart Inventory Control · POS Sales Invoicing · Customer &amp; Supplier Dues
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['Real-time Stock Tracking', 'Multi-lingual English & Bengali', 'Supplier Payables', 'Customer Receivables'].map(
            (badge) => (
              <div
                key={badge}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  color: '#cbd5e1',
                  fontSize: '18px',
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
