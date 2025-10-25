import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'ClipChain AI Video';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          backgroundImage: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #f97316, #ea580c)',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              padding: '0 40px',
            }}
          >
            🎬 ClipChain
          </div>
          <div
            style={{
              fontSize: 40,
              color: '#fff',
              textAlign: 'center',
              padding: '0 60px',
              maxWidth: '800px',
            }}
          >
            {text}
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#9ca3af',
              textAlign: 'center',
            }}
          >
            AI-Generated Video ✨
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
