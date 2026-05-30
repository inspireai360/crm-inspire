import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  const logoData = readFileSync(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundImage: `url(${logoSrc})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        display: 'flex',
      }}
    />,
    { ...size }
  )
}
