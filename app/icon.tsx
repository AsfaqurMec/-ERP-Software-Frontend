import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: '32px',
          fontFamily: 'sans-serif',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
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
