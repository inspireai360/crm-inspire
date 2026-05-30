'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, Contact, Activity, STAGES, STAGE_PROB, fmtMoney, fmtEuro } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import Sparkline from '@/components/ui/Sparkline'
import ActBubble from '@/components/ui/ActBubble'
import { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

const SPARK = {
  diag:        [22,28,26,34,31,40,38,46,52,49,58,64],
  impl:        [5,8,7,12,10,16,15,20,22,21,26,30],
  activos:     [8,9,9,11,10,12,11,13,12,13,14,14],
  close:       [24,26,25,28,27,29,28,30,31,30,32,32],
  ticketDiag:  [1200,1800,1500,2200,2000,2500,2300,2800,3000,2900,3200,3500],
  ticketImpl:  [40,55,48,62,58,70,66,75,80,78,85,90],
  entregados:  [1,2,1,3,2,4,3,4,5,4,6,5],
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sb = createClient()
    const [{ data: d }, { data: a }] = await Promise.all([
      sb.from('deals').select('*').order('created_at', { ascending: false }),
      sb.from('activities').select('*, contact:contacts(name, company:companies(name))').order('created_at', { ascending: false }).limit(6),
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

  const activosDeals = deals.filter(d => d.stage !== 'cerrado')
  const cerrados     = deals.filter(d => d.stage === 'cerrado')
  const closeRate    = deals.length > 0 ? Math.round(cerrados.length / deals.length * 100) : 0

  const revDiag = deals.reduce((a, d) => a + (d.precio_diagnostico ?? 0), 0)
  const revImpl = deals.filter(d => ['cliente_activo','cerrado'].includes(d.stage)).reduce((a, d) => a + (d.precio_implementacion ?? 0), 0)

  const diagConPrecio = deals.filter(d => (d.precio_diagnostico ?? 0) > 0)
  const implConPrecio = deals.filter(d => (d.precio_implementacion ?? 0) > 0 && ['cliente_activo','cerrado'].includes(d.stage))
  const ticketDiag = diagConPrecio.length > 0 ? diagConPrecio.reduce((a, d) => a + d.precio_diagnostico, 0) / diagConPrecio.length : 0
  const ticketImpl = implConPrecio.length > 0 ? implConPrecio.reduce((a, d) => a + d.precio_implementacion, 0) / implConPrecio.length : 0

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const entregadosMes = deals.filter(d =>
    d.notion_link && d.fecha_entrega && new Date(d.fecha_entrega) >= inicioMes && new Date(d.fecha_entrega) <= hoy
  ).length

  const stageData = STAGES.map(s => {
    const sd = deals.filter(d => d.stage === s.id)
    return { ...s, count: sd.length, value: sd.reduce((a, d) => a + (d.precio_diagnostico ?? 0) + (d.precio_implementacion ?? 0), 0) }
  })
  const maxVal = Math.max(...stageData.map(s => s.value), 1)

  const kpis = [
    { label: 'Revenue Diagnósticos', value: fmtEuro(revDiag), delta: '+18%', up: true,  spark: SPARK.diag,       color: 'var(--accent)',  wide: false },
    { label: 'Revenue Implementaciones', value: fmtEuro(revImpl), delta: '+24%', up: true, spark: SPARK.impl,    color: '#8E7BE8',        wide: false },
    { label: 'Deals activos',        value: String(activosDeals.length), delta: '+3', up: true, spark: SPARK.activos, color: 'var(--good)', wide: false },
    { label: 'Close rate',           value: `${closeRate}%`, delta: '+4pt', up: true,   spark: SPARK.close,      color: 'var(--good)',    wide: false },
    { label: 'Ticket medio diagnóstico', value: fmtEuro(ticketDiag), delta: '+8%', up: true, spark: SPARK.ticketDiag, color: 'var(--accent)', wide: false },
    { label: 'Ticket medio implementación', value: fmtEuro(ticketImpl / 1000) + 'k' === 'NaN €k' ? '—' : fmtEuro(ticketImpl), delta: '+12%', up: true, spark: SPARK.ticketImpl, color: '#3FA7A0', wide: false },
    { label: 'Diagnósticos entregados este mes', value: String(entregadosMes), delta: '↑', up: true, spark: SPARK.entregados, color: 'var(--good)', wide: true },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="animate-fade-up">
      <PageHead title="Inicio" sub={`${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})} · Aquí está el estado del trimestre`} />

      {/* KPIs — 6 en grid + 1 ancho */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        {kpis.slice(0, 6).map((k, i) => (
          <Card key={k.label} style={{ gridColumn: 'span 1', animationDelay: `${i * 40}ms` }} className="animate-fade-up col-span-1" pad={18}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[12px] font-[500] leading-tight" style={{ color: 'var(--t3)' }}>{k.label}</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-[600]" style={{ color: k.up ? 'var(--good)' : '#9DB1F2' }}>
                <Icon name={k.up ? 'arrowUp' : 'arrowDn'} size={12} stroke={2} />{k.delta}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="tnum text-[22px] font-[650] tracking-tight leading-none">{k.value}</span>
              <Sparkline data={k.spark} w={80} h={30} color={k.color} />
            </div>
          </Card>
        ))}
      </div>
      {/* Diagnósticos entregados — full width */}
      <Card pad={18} className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-[13px] font-[500]" style={{ color: 'var(--t3)' }}>Diagnósticos entregados este mes</span>
          <div className="tnum text-[32px] font-[650] tracking-tight mt-1">{entregadosMes}</div>
        </div>
        <Sparkline data={SPARK.entregados} w={140} h={40} color="var(--good)" />
      </Card>

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Pipeline por etapa */}
        <Card pad={22}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[16px] font-[600]">Pipeline por etapa</h3>
              <p className="text-[13px] mt-[3px]" style={{ color: 'var(--t3)' }}>{deals.length} oportunidades · {fmtEuro(revDiag + revImpl)} total</p>
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
                  <div style={{ width: `${maxVal > 0 ? (s.value / maxVal) * 100 : 0}%`, height: '100%', borderRadius: 100, background: s.id === 'cerrado' ? 'var(--accent)' : 'linear-gradient(90deg,rgba(79,111,232,0.55),rgba(79,111,232,0.85))', transition: 'width .6s' }} />
                </div>
              </div>
            ))}
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
              <div key={a.id} className="flex items-center gap-3.5 py-[13px]" style={{ borderBottom: i < 4 ? '1px solid var(--line)' : 'none' }}>
                <ActBubble type={a.type} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] truncate">{a.text}</div>
                  {/* @ts-ignore */}
                  <div className="text-[12.5px] mt-0.5 truncate" style={{ color: 'var(--t3)' }}>{a.contact?.company?.name ?? ''}</div>
                </div>
                <OwnerChip owner={a.owner} />
              </div>
            ))}
            {activities.length === 0 && <p className="text-[13px] py-6 text-center" style={{ color: 'var(--t3)' }}>Sin actividad aún.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
