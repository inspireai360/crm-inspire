'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, Activity, STAGES, fmtEuro } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import ActBubble from '@/components/ui/ActBubble'
import { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

// Calcula delta % entre valor actual y anterior
function calcDelta(current: number, previous: number): { label: string; up: boolean | null } {
  if (previous === 0 && current === 0) return { label: '—', up: null }
  if (previous === 0) return { label: 'Nuevo', up: true }
  const pct = ((current - previous) / previous) * 100
  const sign = pct > 0 ? '+' : ''
  return { label: `${sign}${pct.toFixed(0)}%`, up: pct >= 0 }
}

function calcDeltaAbs(current: number, previous: number): { label: string; up: boolean | null } {
  if (previous === 0 && current === 0) return { label: '—', up: null }
  const diff = current - previous
  const sign = diff > 0 ? '+' : ''
  return { label: diff !== 0 ? `${sign}${diff}` : '=', up: diff > 0 }
}

interface KpiCardProps {
  label: string
  value: string
  delta: string
  up: boolean | null
  color: string
}

function KpiCard({ label, value, delta, up, color }: KpiCardProps) {
  return (
    <Card pad={18} className="animate-fade-up">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[12px] font-[500] leading-tight" style={{ color: 'var(--t3)' }}>{label}</span>
        {delta === '—' ? (
          <span className="text-[12px]" style={{ color: 'var(--t4)' }}>—</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-[600]"
            style={{ color: up === null ? 'var(--t4)' : up ? 'var(--good)' : 'var(--bad)' }}>
            {up !== null && <Icon name={up ? 'arrowUp' : 'arrowDn'} size={12} stroke={2} />}
            {delta}
          </span>
        )}
      </div>
      <div className="tnum text-[24px] font-[650] tracking-tight leading-none" style={{ color }}>{value}</div>
    </Card>
  )
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sb = createClient()
    const [{ data: d }, { data: a }] = await Promise.all([
      sb.from('deals').select('*').order('created_at', { ascending: false }),
      sb.from('activities')
        .select('*, contact:contacts(name, company:companies(name))')
        .order('created_at', { ascending: false }).limit(6),
    ])
    setDeals(d ?? [])
    setActivities(a ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const sb = createClient()
    const ch = sb.channel('dashboard-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, load)
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [load])

  // Fechas de periodos
  const now    = new Date()
  const start  = new Date(now.getFullYear(), now.getMonth(), 1)       // inicio mes actual
  const prevS  = new Date(now.getFullYear(), now.getMonth() - 1, 1)   // inicio mes anterior
  const prevE  = new Date(now.getFullYear(), now.getMonth(), 0)        // fin mes anterior

  const inPeriod = (iso: string, from: Date, to: Date) => {
    const d = new Date(iso)
    return d >= from && d <= to
  }

  // Métricas actuales (mes actual)
  const dealsActivos   = deals.filter(d => d.stage !== 'cerrado')
  const cerradosMes    = deals.filter(d => d.stage === 'cerrado' && inPeriod(d.updated_at ?? d.created_at, start, now))
  const cerradosPrevMes= deals.filter(d => d.stage === 'cerrado' && inPeriod(d.updated_at ?? d.created_at, prevS, prevE))

  const revDiag = deals.reduce((a, d) => a + (d.precio_diagnostico ?? 0), 0)
  const revImpl = deals.filter(d => ['cliente_activo','cerrado'].includes(d.stage))
                       .reduce((a, d) => a + (d.precio_implementacion ?? 0), 0)

  // Mes anterior
  const dealsMesActual = deals.filter(d => inPeriod(d.created_at, start, now))
  const dealsMesAnterior = deals.filter(d => inPeriod(d.created_at, prevS, prevE))

  const revDiagPrev = dealsMesAnterior.reduce((a, d) => a + (d.precio_diagnostico ?? 0), 0)
  const revImplPrev = dealsMesAnterior.filter(d => ['cliente_activo','cerrado'].includes(d.stage))
                                       .reduce((a, d) => a + (d.precio_implementacion ?? 0), 0)

  const closeRate = deals.length > 0 ? Math.round(cerradosMes.length / Math.max(deals.length, 1) * 100) : 0
  const closeRatePrev = dealsMesAnterior.length > 0 ? Math.round(cerradosPrevMes.length / Math.max(dealsMesAnterior.length, 1) * 100) : 0

  const diagConPrecio = deals.filter(d => (d.precio_diagnostico ?? 0) > 0)
  const implConPrecio = deals.filter(d => (d.precio_implementacion ?? 0) > 0 && ['cliente_activo','cerrado'].includes(d.stage))
  const ticketDiag = diagConPrecio.length > 0 ? diagConPrecio.reduce((a, d) => a + d.precio_diagnostico, 0) / diagConPrecio.length : 0
  const ticketImpl = implConPrecio.length > 0 ? implConPrecio.reduce((a, d) => a + d.precio_implementacion, 0) / implConPrecio.length : 0

  const diagPrevConPrecio = dealsMesAnterior.filter(d => (d.precio_diagnostico ?? 0) > 0)
  const implPrevConPrecio = dealsMesAnterior.filter(d => (d.precio_implementacion ?? 0) > 0)
  const ticketDiagPrev = diagPrevConPrecio.length > 0 ? diagPrevConPrecio.reduce((a, d) => a + d.precio_diagnostico, 0) / diagPrevConPrecio.length : 0
  const ticketImplPrev = implPrevConPrecio.length > 0 ? implPrevConPrecio.reduce((a, d) => a + d.precio_implementacion, 0) / implPrevConPrecio.length : 0

  const entregadosMes = deals.filter(d =>
    d.notion_link && d.fecha_entrega && new Date(d.fecha_entrega) >= start && new Date(d.fecha_entrega) <= now
  ).length
  const entregadosPrevMes = deals.filter(d =>
    d.notion_link && d.fecha_entrega && new Date(d.fecha_entrega) >= prevS && new Date(d.fecha_entrega) <= prevE
  ).length

  const stageData = STAGES.map(s => {
    const sd = deals.filter(d => d.stage === s.id)
    return { ...s, count: sd.length, value: sd.reduce((a, d) => a + (d.precio_diagnostico ?? 0) + (d.precio_implementacion ?? 0), 0) }
  })
  const maxVal = Math.max(...stageData.map(s => s.value), 1)
  const totalPipeline = deals.reduce((a, d) => a + (d.precio_diagnostico ?? 0) + (d.precio_implementacion ?? 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  const dRevDiag  = calcDelta(revDiag, revDiagPrev)
  const dRevImpl  = calcDelta(revImpl, revImplPrev)
  const dActivos  = calcDeltaAbs(dealsActivos.length, dealsMesAnterior.filter(d => d.stage !== 'cerrado').length)
  const dClose    = calcDeltaAbs(closeRate, closeRatePrev)
  const dTkDiag   = calcDelta(ticketDiag, ticketDiagPrev)
  const dTkImpl   = calcDelta(ticketImpl, ticketImplPrev)
  const dEntregados = calcDeltaAbs(entregadosMes, entregadosPrevMes)

  return (
    <div className="animate-fade-up">
      <PageHead title="Inicio"
        sub={`${now.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})} · Estado del trimestre`} />

      {/* 6 KPIs */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        <KpiCard label="Revenue Diagnósticos" value={fmtEuro(revDiag)}         delta={dRevDiag.label}  up={dRevDiag.up}  color="var(--accent)" />
        <KpiCard label="Revenue Implementaciones" value={fmtEuro(revImpl)}     delta={dRevImpl.label}  up={dRevImpl.up}  color="#8E7BE8" />
        <KpiCard label="Deals activos"         value={String(dealsActivos.length)} delta={dActivos.label} up={dActivos.up}  color="var(--good)" />
        <KpiCard label="Close rate"            value={`${closeRate}%`}         delta={dClose.label === '—' ? '—' : dClose.label+'pt'} up={dClose.up} color="var(--good)" />
        <KpiCard label="Ticket medio diagnóstico" value={fmtEuro(ticketDiag)} delta={dTkDiag.label}   up={dTkDiag.up}   color="var(--accent)" />
        <KpiCard label="Ticket medio implementación" value={fmtEuro(ticketImpl)} delta={dTkImpl.label} up={dTkImpl.up}   color="#3FA7A0" />
      </div>

      {/* Diagnósticos entregados — ancho completo */}
      <Card pad={18} className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-[500] mb-1" style={{ color: 'var(--t3)' }}>Diagnósticos entregados este mes</div>
            <div className="tnum text-[32px] font-[650] tracking-tight">{entregadosMes}</div>
          </div>
          {dEntregados.label !== '—' && (
            <span className="inline-flex items-center gap-1 text-[14px] font-[600]"
              style={{ color: dEntregados.up ? 'var(--good)' : 'var(--bad)' }}>
              <Icon name={dEntregados.up ? 'arrowUp' : 'arrowDn'} size={16} stroke={2} />
              {dEntregados.label} vs mes anterior
            </span>
          )}
        </div>
      </Card>

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Pipeline por etapa */}
        <Card pad={22}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[16px] font-[600]">Pipeline por etapa</h3>
              <p className="text-[13px] mt-[3px]" style={{ color: 'var(--t3)' }}>
                {deals.length} oportunidades · {fmtEuro(totalPipeline)} total
              </p>
            </div>
            <span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Valor ponderado</span>
          </div>
          <div className="flex flex-col gap-4">
            {stageData.map(s => (
              <div key={s.id}>
                <div className="flex justify-between mb-[7px] items-baseline">
                  <span className="text-[13px] font-[500]">{s.label}
                    <span className="ml-2 font-normal" style={{ color: 'var(--t4)' }}>{s.count}</span>
                  </span>
                  <span className="tnum text-[13px] font-[600]" style={{ color: 'var(--t2)' }}>{fmtEuro(s.value)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--s2)' }}>
                  <div style={{ width: `${(s.value / maxVal) * 100}%`, height: '100%', borderRadius: 100,
                    background: s.id === 'cerrado' ? 'var(--accent)' : 'linear-gradient(90deg,rgba(79,111,232,0.55),rgba(79,111,232,0.85))',
                    transition: 'width .6s' }} />
                </div>
              </div>
            ))}
            {deals.length === 0 && (
              <p className="text-[13px] py-4 text-center" style={{ color: 'var(--t3)' }}>Sin oportunidades aún.</p>
            )}
          </div>
        </Card>

        {/* Actividad reciente */}
        <Card pad={22}>
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="text-[16px] font-[600]">Actividad reciente</h3>
            <Link href="/activities" className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Ver todo</Link>
          </div>
          <div>
            {activities.slice(0, 5).map((a, i) => (
              <div key={a.id} className="flex items-center gap-3.5 py-[13px]"
                style={{ borderBottom: i < 4 ? '1px solid var(--line)' : 'none' }}>
                <ActBubble type={a.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] truncate">{a.text}</div>
                  {/* @ts-ignore */}
                  <div className="text-[12.5px] mt-0.5 truncate" style={{ color: 'var(--t3)' }}>
                    {(a as any).contact?.company?.name ?? (a as any).contact?.name ?? ''}
                  </div>
                </div>
                <OwnerChip owner={a.owner} />
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-[13px] py-6 text-center" style={{ color: 'var(--t3)' }}>Sin actividad aún.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
