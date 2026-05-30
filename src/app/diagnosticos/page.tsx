'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Deal, AREAS, AREA_STATUSES, AreaStatus, fmtEuro } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import Avatar, { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'

const STATUS_COLOR: Record<AreaStatus, string> = {
  pendiente:   'rgba(255,255,255,0.26)',
  en_progreso: '#E8A24F',
  completado:  '#3FB984',
}
const STATUS_BG: Record<AreaStatus, string> = {
  pendiente:   'rgba(255,255,255,0.04)',
  en_progreso: 'rgba(232,162,79,0.12)',
  completado:  'rgba(63,185,132,0.12)',
}

function AreaDot({ status }: { status: AreaStatus }) {
  return (
    <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ background: STATUS_COLOR[status] }} />
  )
}

export default function DiagnosticosPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filterArea, setFilterArea] = useState<string>('all')
  const router = useRouter()

  const load = useCallback(async () => {
    const sb = createClient()
    const { data } = await sb.from('deals')
      .select('*, contact:contacts(id,name,type,company:companies(name))')
      .in('stage', ['diagnostico_activo', 'propuesta_implementacion', 'cliente_activo', 'cerrado'])
      .order('created_at', { ascending: false })
    setDeals(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateAreaStatus = async (dealId: string, area: string, status: AreaStatus) => {
    const sb = createClient()
    await sb.from('deals').update({ [area]: status }).eq('id', dealId)
    setDeals(ds => ds.map(d => d.id === dealId ? { ...d, [area]: status } as Deal : d))
  }

  const activos   = deals.filter(d => d.stage === 'diagnostico_activo')
  const entregados = deals.filter(d => ['propuesta_implementacion','cliente_activo','cerrado'].includes(d.stage))

  const completedAreas = (d: Deal) => AREAS.filter(a => (d[a.key as keyof Deal] as AreaStatus) === 'completado').length

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} /></div>

  const DiagCard = ({ d }: { d: Deal }) => {
    // @ts-ignore
    const contact = d.contact
    const done = completedAreas(d)
    const isCerrado = d.stage === 'cerrado' || !!d.notion_link

    return (
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {/* Cabecera de la tarjeta */}
        <div className="flex items-center gap-4 p-5" style={{ borderBottom: '1px solid var(--line)' }}>
          {contact && <Avatar name={contact.name} type={contact.type} size={44} />}
          <div className="flex-1 min-w-0">
            <button onClick={() => contact && router.push(`/contacts/${contact.id}`)}
              className="text-[15px] font-[600] truncate hover:opacity-80 text-left w-full transition-opacity">
              {d.title}
            </button>
            <div className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--t3)' }}>
              {contact?.company?.name ?? contact?.name ?? '—'}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="tnum text-[14px] font-[600]">{fmtEuro(d.precio_diagnostico ?? 0)}</div>
              <div className="text-[11.5px]" style={{ color: 'var(--t3)' }}>diagnóstico</div>
            </div>
            <OwnerChip owner={d.owner} size={28} />
          </div>
        </div>

        {/* 4 áreas */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-[500]" style={{ color: 'var(--t3)' }}>Áreas auditadas</span>
            <span className="text-[12.5px] font-[600]" style={{ color: done === 4 ? 'var(--good)' : 'var(--t3)' }}>{done}/4 completadas</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {AREAS.map(area => {
              const status = (d[area.key as keyof Deal] as AreaStatus) ?? 'pendiente'
              const nextStatus: Record<AreaStatus, AreaStatus> = { pendiente: 'en_progreso', en_progreso: 'completado', completado: 'pendiente' }
              return (
                <button key={area.key}
                  onClick={() => updateAreaStatus(d.id, area.key, nextStatus[status])}
                  className="flex items-center justify-between p-2.5 rounded-[10px] text-left transition-all hover:opacity-90"
                  style={{ background: STATUS_BG[status], boxShadow: `inset 0 0 0 1px ${STATUS_COLOR[status]}44` }}
                  title="Clic para cambiar estado">
                  <span className="text-[13px] font-[500]">{area.label}</span>
                  <span className="flex items-center gap-1.5 text-[11.5px] font-[550]" style={{ color: STATUS_COLOR[status] }}>
                    <AreaDot status={status} />
                    {AREA_STATUSES.find(s => s.value === status)?.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Fechas y Notion */}
          <div className="flex items-center gap-4 flex-wrap">
            {d.fecha_inicio && (
              <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--t3)' }}>
                <Icon name="calendar" size={13} />
                Inicio: {new Date(d.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {d.fecha_entrega && (
              <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--t3)' }}>
                <Icon name="clock" size={13} />
                Entrega: {new Date(d.fecha_entrega).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {d.notion_link ? (
              <a href={d.notion_link} target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-[550] hover:opacity-80 transition-opacity"
                style={{ background: 'rgba(79,111,232,0.14)', color: '#9DB1F2', boxShadow: 'inset 0 0 0 1px rgba(79,111,232,0.35)' }}>
                <Icon name="external" size={13} />Ver en Notion
              </a>
            ) : (
              <span className="ml-auto text-[12px]" style={{ color: 'var(--t4)' }}>Sin entregable aún</span>
            )}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="h-[3px]" style={{ background: 'var(--s2)' }}>
          <div style={{ width: `${done / 4 * 100}%`, height: '100%', background: done === 4 ? 'var(--good)' : 'var(--accent)', transition: 'width .4s' }} />
        </div>
      </Card>
    )
  }

  return (
    <div className="animate-fade-up">
      <PageHead
        title="Diagnósticos"
        sub={`${activos.length} en curso · ${entregados.length} entregados`}
        right={
          <div className="flex items-center gap-3 text-[12.5px]" style={{ color: 'var(--t3)' }}>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.26)' }}/>Pendiente</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#E8A24F' }}/>En progreso</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#3FB984' }}/>Completado</span>
          </div>
        }
      />

      {/* En curso */}
      {activos.length > 0 && (
        <>
          <div className="text-[12px] font-[600] uppercase tracking-[0.05em] mb-3 ml-1" style={{ color: 'var(--t3)' }}>En curso — {activos.length}</div>
          <div className="flex flex-col gap-4 mb-8">
            {activos.map(d => <DiagCard key={d.id} d={d} />)}
          </div>
        </>
      )}

      {/* Entregados */}
      {entregados.length > 0 && (
        <>
          <div className="text-[12px] font-[600] uppercase tracking-[0.05em] mb-3 ml-1" style={{ color: 'var(--t3)' }}>Entregados — {entregados.length}</div>
          <div className="flex flex-col gap-4">
            {entregados.map(d => <DiagCard key={d.id} d={d} />)}
          </div>
        </>
      )}

      {deals.length === 0 && (
        <Card><div className="py-12 text-center text-[14px]" style={{ color: 'var(--t3)' }}>Sin diagnósticos activos. Mueve una oportunidad a la etapa "Diagnóstico activo" para verla aquí.</div></Card>
      )}
    </div>
  )
}
