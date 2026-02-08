import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  const grid = [
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
  ]
  const colors = ['#ef4444', '#f97316', '#06b6d4', '#a855f7']

  return new ImageResponse(
    (
      <div
        style={{
          width: '32px',
          height: '32px',
          background: '#08080f',
          display: 'flex',
          flexDirection: 'column',
          padding: '2px',
          gap: '2px',
        }}
      >
        {grid.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: '2px', flex: 1 }}>
            {row.map((cell, c) => (
              <div
                key={c}
                style={{
                  flex: 1,
                  background: cell ? colors[r] : '#1a1a2e',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    ),
    { ...size }
  )
}
