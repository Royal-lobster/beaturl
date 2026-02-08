import { ImageResponse } from 'next/og'

export const alt = 'BeatURL — Share Beats via URL'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  const colors = ['#ef4444', '#f97316', '#06b6d4', '#a855f7', '#22c55e']
  const labels = ['KICK', 'SNARE', 'HIHAT', 'CLAP', 'PERC']
  // Pattern for each row (16 steps)
  const patterns = [
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0],
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#08080f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 60px',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
            fontFamily: 'sans-serif',
          }}
        >
          BEATURL
        </div>
        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#888',
            marginTop: '4px',
            marginBottom: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          Share Beats via URL
        </div>
        {/* Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '100%',
            maxWidth: '900px',
          }}
        >
          {patterns.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div
                style={{
                  width: '60px',
                  fontSize: '12px',
                  color: colors[r],
                  fontFamily: 'monospace',
                  fontWeight: 700,
                }}
              >
                {labels[r]}
              </div>
              {row.map((cell, c) => (
                <div
                  key={c}
                  style={{
                    width: '46px',
                    height: '32px',
                    background: cell ? colors[r] : '#1a1a2e',
                    opacity: cell ? 1 : 0.5,
                    borderRadius: '2px',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div
          style={{
            fontSize: '16px',
            color: '#555',
            marginTop: '40px',
            fontFamily: 'monospace',
          }}
        >
          No Database · URL Encoded · Web Audio API
        </div>
      </div>
    ),
    { ...size }
  )
}
