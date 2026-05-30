import { ContactType, DealStage, STAGES } from '@/lib/types'

const TYPE_MAP = {
  customer: { label: 'Cliente',   c: '#9DB1F2',              bg: 'rgba(79,111,232,0.14)',  dot: '#4F6FE8' },
  prospect: { label: 'Prospecto', c: 'rgba(255,255,255,0.78)',bg: 'rgba(255,255,255,0.06)', dot: 'rgba(255,255,255,0.55)' },
  lead:     { label: 'Lead',      c: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.035)',dot: 'rgba(255,255,255,0.32)' },
}

export function TypeBadge({ type }: { type: ContactType }) {
  const m = TYPE_MAP[type]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 9px', borderRadius: 100, background: m.bg, color: m.c, fontSize: 12, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />{m.label}
    </span>
  )
}

export function StagePill({ stage }: { stage: DealStage }) {
  const st = STAGES.find(s => s.id === stage)
  const cerrado = stage === 'cerrado'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 9px', borderRadius: 100, background: cerrado ? 'rgba(79,111,232,0.14)' : 'rgba(255,255,255,0.05)', color: cerrado ? '#9DB1F2' : 'rgba(255,255,255,0.66)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cerrado ? '#4F6FE8' : 'rgba(255,255,255,0.3)' }} />{st?.label}
    </span>
  )
}
