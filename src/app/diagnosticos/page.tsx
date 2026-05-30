'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Deal, DiagnosticoRespuesta, AREAS, AREA_STATUSES, AreaStatus, fmtEuro } from '@/lib/types'
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

const AREA_WEB_LABEL: Record<string, string> = {
  ventas:                       'Ventas',
  marketing:                    'Marketing',
  operaciones:                  'Operaciones',
  delivery:                     'Fulfillment / Delivery',
  administracion_documentacion: 'Operaciones',
}

export default function DiagnosticosPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [respuestas, setRespuestas] = useState<DiagnosticoRespuesta[]>([])
  const [expanded, setExpanded] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const load = useCallback(async () => {
    const sb = createClient()
    const [{ data: d }, { data: r }] = await Promise.all([
      sb.from('deals')
        .select('*, contact:contacts(id,name,type,tamanio_empresa,company:companies(name))')
        .in('stage', ['diagnostico_activo','propuesta_implementacion','cliente_activo','cerrado'])
        .order('created_at', { ascending: false }),
      sb.from('diagnostico_respuestas')
        .select('*')
        .order('created_at', { ascending: false }),
    ])
    setDeals(d ?? [])
    setRespuestas(r ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateAreaStatus = async (dealId: string, area: string, status: AreaStatus) => {
    const sb = createClient()
    await sb.from('deals').update({ [area]: status }).eq('id', dealId)
    setDeals(ds => ds.map(d => d.id === dealId ? { ...d, [area]: status } as Deal : d))
  }

  const completedAreas = (d: Deal) =>
    AREAS.filter(a => (d[a.key as keyof Deal] as AreaStatus) === 'completado').length

  const dealRespuestas = (dealId: string) =>
    respuestas.filter(r => r.deal_id === dealId)

  const activos    = deals.filter(d => d.stage === 'diagnostico_activo')
  const entregados = deals.filter(d => ['propuesta_implementacion','cliente_activo','cerrado'].includes(d.stage))

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  const DiagCard = ({ d }: { d: Deal }) => {
    const contact = (d as any).contact
    const done = completedAreas(d)
    const dRespuestas = dealRespuestas(d.id)
    const expandedArea = expanded[d.id] ?? null

    return (
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {/* Cabecera */}
        <div className="flex items-center gap-4 p-5" style={{ borderBottom: '1px solid var(--line)' }}>
          {contact && <Avatar name={contact.name} type={contact.type} size={44} />}
          <div className="flex-1 min-w-0">
            <button onClick={() => contact && router.push(`/contacts/${contact.id}`)}
              className="text-[15px] font-[600] truncate hover:opacity-80 text-left w-full transition-opacity">
              {d.title}
            </button>
            <div className="text-[13px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--t3)' }}>
              <span className="truncate">{contact?.company?.name ?? contact?.name ?? '—'}</span>
              {contact?.tamanio_empresa && (
                <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--s3)' }}>
                  {contact.tamanio_empresa} empleados
                </span>
              )}
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

        {/* 4 áreas con estado clickeable */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-[500]" style={{ color: 'var(--t3)' }}>Estado por área</span>
            <span className="text-[12.5px] font-[600]" style={{ color: done === 4 ? 'var(--good)' : 'var(--t3)' }}>
              {done}/4 completadas
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {AREAS.map(area => {
              const status = (d[area.key as keyof Deal] as AreaStatus) ?? 'pendiente'
              const nextStatus: Record<AreaStatus, AreaStatus> = {
                pendiente: 'en_progreso', en_progreso: 'completado', completado: 'pendiente'
              }
              // Buscar si hay respuestas de cuestionario para esta área
              const areaWebKey = Object.entries({
                ventas_status: 'ventas', marketing_status: 'marketing',
                operaciones_status: 'operaciones', delivery_status: 'delivery',
              }).find(([k]) => k === area.key)?.[1]
              const tieneRespuestas = areaWebKey && dRespuestas.some(r => r.area === areaWebKey || r.area === 'administracion_documentacion' && areaWebKey === 'operaciones')

              return (
                <div key={area.key} className="flex flex-col gap-1.5">
                  <button
                    onClick={() => updateAreaStatus(d.id, area.key, nextStatus[status])}
                    className="flex items-center justify-between p-2.5 rounded-[10px] text-left transition-all hover:opacity-90"
                    style={{ background: STATUS_BG[status], boxShadow: `inset 0 0 0 1px ${STATUS_COLOR[status]}44` }}
                    title="Clic para cambiar estado">
                    <span className="text-[13px] font-[500]">{area.label}</span>
                    <span className="flex items-center gap-1.5 text-[11.5px] font-[550]" style={{ color: STATUS_COLOR[status] }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
                      {AREA_STATUSES.find(s => s.value === status)?.label}
                    </span>
                  </button>
                  {tieneRespuestas && (
                    <button
                      onClick={() => setExpanded(e => ({ ...e, [d.id]: e[d.id] === area.key ? null : area.key }))}
                      className="text-[11.5px] text-left px-2 hover:opacity-80 transition-opacity"
                      style={{ color: '#9DB1F2' }}>
                      {expandedArea === area.key ? '▲ Ocultar respuestas' : '▼ Ver respuestas del cuestionario'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Respuestas expandidas del cuestionario */}
          {expandedArea && (() => {
            const areaWebKey = {
              ventas_status: ['ventas'],
              marketing_status: ['marketing'],
              operaciones_status: ['operaciones','administracion_documentacion'],
              delivery_status: ['delivery','fulfillment'],
            }[expandedArea] ?? []
            const areaResp = dRespuestas.find(r => areaWebKey.includes(r.area))
            if (!areaResp) return null
            return (
              <div className="mb-4 rounded-[12px] overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <div className="px-4 py-3 flex justify-between items-center" style={{ background: 'var(--s2)', borderBottom: '1px solid var(--line)' }}>
                  <span className="text-[13px] font-[600]">{AREA_WEB_LABEL[areaResp.area]} — {areaResp.respuestas.length} respuestas</span>
                  <span className="text-[12px] px-2 py-1 rounded-lg font-[550]"
                    style={{ background: areaResp.prioridad === 'Alta' ? 'rgba(232,111,111,0.15)' : areaResp.prioridad === 'Media' ? 'rgba(232,162,79,0.15)' : 'rgba(63,185,132,0.15)',
                    color: areaResp.prioridad === 'Alta' ? 'var(--bad)' : areaResp.prioridad === 'Media' ? 'var(--warn)' : 'var(--good)' }}>
                    Prioridad {areaResp.prioridad}
                  </span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {areaResp.respuestas.map((r, i) => (
                    <div key={r.id} className="px-4 py-3" style={{ borderBottom: i < areaResp.respuestas.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div className="text-[12px] font-[500] mb-1" style={{ color: 'var(--t3)' }}>{r.label}</div>
                      <div className="text-[13px]" style={{ color: r.answer ? 'var(--t1)' : 'var(--t4)' }}>
                        {r.answer || '—'}
                      </div>
                    </div>
                  ))}
                </div>
                {areaResp.observaciones && (
                  <div className="px-4 py-3" style={{ background: 'rgba(79,111,232,0.06)', borderTop: '1px solid var(--line)' }}>
                    <div className="text-[12px] font-[600] mb-1" style={{ color: 'var(--t3)' }}>OBSERVACIONES INTERNAS</div>
                    <div className="text-[13px] whitespace-pre-wrap">{areaResp.observaciones}</div>
                  </div>
                )}
              </div>
            )
          })()}

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
            {dRespuestas.length > 0 && (
              <span className="text-[12px] flex items-center gap-1.5" style={{ color: 'var(--good)' }}>
                <Icon name="check" size={13} stroke={2} />
                {dRespuestas.length} cuestionario{dRespuestas.length > 1 ? 's' : ''} recibido{dRespuestas.length > 1 ? 's' : ''}
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

      {activos.length > 0 && (
        <>
          <div className="text-[12px] font-[600] uppercase tracking-[0.05em] mb-3 ml-1" style={{ color: 'var(--t3)' }}>En curso — {activos.length}</div>
          <div className="flex flex-col gap-4 mb-8">
            {activos.map(d => <DiagCard key={d.id} d={d} />)}
          </div>
        </>
      )}

      {entregados.length > 0 && (
        <>
          <div className="text-[12px] font-[600] uppercase tracking-[0.05em] mb-3 ml-1" style={{ color: 'var(--t3)' }}>Entregados — {entregados.length}</div>
          <div className="flex flex-col gap-4">
            {entregados.map(d => <DiagCard key={d.id} d={d} />)}
          </div>
        </>
      )}

      {deals.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <div className="text-[15px] font-[500] mb-2">Sin diagnósticos activos</div>
            <div className="text-[13px]" style={{ color: 'var(--t3)' }}>Cuando un cliente rellene el cuestionario en la web, aparecerá aquí automáticamente.</div>
          </div>
        </Card>
      )}
    </div>
  )
}
