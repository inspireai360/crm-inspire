'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Activity } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import ActBubble from '@/components/ui/ActBubble'
import { OwnerChip } from '@/components/ui/Avatar'

const CHIPS = [
  ['all','Todas'], ['call','Llamadas'], ['email','Emails'],
  ['meeting','Reuniones'], ['note','Notas'], ['deal','Oportunidades'],
]

export default function ActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const router = useRouter()

  const load = useCallback(async () => {
    const sb = createClient()
    const { data } = await sb.from('activities')
      .select('*, contact:contacts(id,name,company:companies(name))')
      .order('created_at', { ascending: false })
    setActivities(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered  = activities.filter(a => type === 'all' || a.type === type)
  const proximas  = filtered.filter(a => a.scheduled_at && new Date(a.scheduled_at) > new Date())
  const recientes = filtered.filter(a => !a.scheduled_at || new Date(a.scheduled_at) <= new Date())

  const Item = ({ a }: { a: Activity }) => (
    <button onClick={() => a.contact_id && router.push(`/contacts/${a.contact_id}`)}
      className="row-btn flex items-center gap-3.5 p-[14px] w-full text-left rounded-[12px] transition-colors">
      <ActBubble type={a.type} size={36} />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-[500] truncate">{a.text}</div>
        {/* @ts-ignore */}
        <div className="text-[12.5px] mt-0.5 truncate" style={{ color: 'var(--t3)' }}>{a.contact?.company?.name ?? a.contact?.name ?? ''}</div>
      </div>
      <OwnerChip owner={a.owner} />
      <div className="w-[92px] text-right shrink-0">
        <div className="text-[12.5px] font-[550]" style={{ color: 'var(--t2)' }}>
          {a.scheduled_at
            ? new Date(a.scheduled_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
            : new Date(a.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </div>
        {a.scheduled_at && (
          <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--t4)' }}>
            {new Date(a.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </button>
  )

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} /></div>

  return (
    <div className="animate-fade-up">
      <PageHead title="Actividades" sub="Todo lo que ocurre en tus cuentas" />

      <div className="flex gap-1 p-1 rounded-[11px] mb-5 w-fit" style={{ background: 'var(--s1)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        {CHIPS.map(([k, label]) => (
          <button key={k} onClick={() => setType(k)}
            className="px-[13px] py-[7px] rounded-lg text-[13px] font-[500] transition-all"
            style={{ background: type === k ? 'var(--s3)' : 'transparent', color: type === k ? '#fff' : 'var(--t3)', boxShadow: type === k ? 'inset 0 0 0 1px var(--line2)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {proximas.length > 0 && (
        <>
          <div className="text-[12px] font-[600] uppercase tracking-[0.05em] mb-2 ml-1" style={{ color: 'var(--t3)' }}>Próximas</div>
          <Card pad={6} className="mb-[18px]">
            {proximas.map((a, i) => <div key={a.id} style={{ borderBottom: i < proximas.length - 1 ? '1px solid var(--line)' : 'none' }}><Item a={a} /></div>)}
          </Card>
        </>
      )}
      {recientes.length > 0 && (
        <>
          <div className="text-[12px] font-[600] uppercase tracking-[0.05em] mb-2 ml-1" style={{ color: 'var(--t3)' }}>Recientes</div>
          <Card pad={6}>
            {recientes.map((a, i) => <div key={a.id} style={{ borderBottom: i < recientes.length - 1 ? '1px solid var(--line)' : 'none' }}><Item a={a} /></div>)}
          </Card>
        </>
      )}
      {filtered.length === 0 && <Card><div className="py-8 text-center text-[14px]" style={{ color: 'var(--t3)' }}>Sin actividades de este tipo.</div></Card>}
    </div>
  )
}
