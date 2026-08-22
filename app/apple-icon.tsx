import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '36px',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '84px',
          fontFamily: 'sans-serif',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
        }}
      >
        SP
      </div>
    ),
    {
      ...size,
    }
  );
}
