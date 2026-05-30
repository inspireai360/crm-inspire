import { ContactType } from '@/lib/types'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function hueFor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return h
}

interface AvatarProps {
  name: string
  type?: ContactType
  size?: number
}

export default function Avatar({ name, type, size = 36 }: AvatarProps) {
  const h = hueFor(name)
  const isCust = type === 'customer'
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
      display: 'grid', placeItems: 'center',
      background: isCust ? 'rgba(79,111,232,0.14)' : `oklch(0.32 0.05 ${h})`,
      color: isCust ? '#9DB1F2' : `oklch(0.82 0.06 ${h})`,
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: 0,
      boxShadow: `inset 0 0 0 1px ${isCust ? 'rgba(79,111,232,0.35)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      {initials(name)}
    </div>
  )
}

interface OwnerChipProps {
  owner: string
  size?: number
  color?: string
}

export function OwnerChip({ owner, size = 22, color = '#4F6FE8' }: OwnerChipProps) {
  const colors: Record<string, string> = { LL: '#4F6FE8', TI: '#8E7BE8', ME: '#3FA7A0' }
  const c = colors[owner] ?? color
  return (
    <div title={owner} style={{
      width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center',
      background: 'var(--s3)', color: c, fontSize: size * 0.42, fontWeight: 600,
      boxShadow: `inset 0 0 0 1.5px ${c}55`, flexShrink: 0,
    }}>{owner}</div>
  )
}
