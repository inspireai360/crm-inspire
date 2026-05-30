import Icon from './Icon'
import { ActivityType } from '@/lib/types'

const ACT_ICON: Record<string, string> = {
  call: 'phone', email: 'mail', meeting: 'meeting', note: 'note',
  deal: 'deal', demo: 'spark', review: 'note',
}

export default function ActBubble({ type, size = 34 }: { type: ActivityType | string; size?: number }) {
  const isDeal = type === 'deal'
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3, display: 'grid', placeItems: 'center', flexShrink: 0,
      background: isDeal ? 'rgba(79,111,232,0.14)' : 'rgba(255,255,255,0.05)',
      color: isDeal ? '#9DB1F2' : 'rgba(255,255,255,0.66)',
      boxShadow: isDeal ? 'inset 0 0 0 1px rgba(79,111,232,0.35)' : 'inset 0 0 0 1px rgba(255,255,255,0.07)',
    }}>
      <Icon name={ACT_ICON[type] ?? 'note'} size={size * 0.46} />
    </div>
  )
}
