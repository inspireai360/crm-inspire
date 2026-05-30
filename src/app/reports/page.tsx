'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, STAGES, OWNERS, fmtEuro } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import { OwnerChip } from '@/components/ui/Avatar'

function AreaChart({ data }: { data: number[] }) {
  const w = 640, h = 180
  const min = Math.min(...data) * 0.9, max = Math.max(...data) * 1.04, span = max - min || 1
  const X = (i: number) => (i / (data.length - 1)) * w
  const Y = (v: number) => h - ((v - min) / span) * h
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${w} ${h} L0 ${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block' }}>
      <defs><linearGradient id="ac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity="0.26"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1="0" x2={w} y1={h*f} y2={h*f} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>)}
      <path d={area} fill="url(#ac)"/><path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v, i) => i === data.length - 1 && <circle key={i} cx={X(i)} cy={Y(v)} r="4" fill="var(--accent)"/>)}
    </svg>
  )
}

function Donut({ pct }: { pct: number }) {
  const size = 132, r = size / 2 - 11, C = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--s3)" strokeWidth="11"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${C*pct/100} ${C}`}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div><div className="tnum text-[26px] font-[700]">{pct}%</div><div className="text-[11.5px]" style={{ color: 'var(--t3)' }}>cierre</div></div>
      </div>
    </div>
  )
}

const REV_SERIES = [4200,5100,4800,6200,5900,7100,6800,8200,7900,9100,9600,10400]

export default function InformesPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  useEffect(() => { createClient().from('deals').select('*').then(({ data }) => setDeals(data ?? [])) }, [])

  const cerrados = deals.filter(d => d.stage === 'cerrado')
  const closeRate = deals.length > 0 ? Math.round(cerrados.length / deals.length * 100) : 0
  const totalDiag = deals.reduce((a, d) => a + (d.precio_diagnostico ?? 0), 0)
  const totalImpl = cerrados.reduce((a, d) => a + (d.precio_implementacion ?? 0), 0)

  const byOwner = Object.keys(OWNERS).map(k => ({
    k, name: OWNERS[k as keyof typeof OWNERS].name,
    diag: deals.filter(d => d.owner === k).reduce((a, d) => a + (d.precio_diagnostico ?? 0), 0),
    impl: deals.filter(d => d.owner === k).reduce((a, d) => a + (d.precio_implementacion ?? 0), 0),
    count: deals.filter(d => d.owner === k).length,
  })).sort((a, b) => (b.diag + b.impl) - (a.diag + a.impl))
  const maxOwner = Math.max(...byOwner.map(o => o.diag + o.impl), 1)

  const stageData = STAGES.map(s => ({ ...s, count: deals.filter(d => d.stage === s.id).length }))
  const maxStage = Math.max(...stageData.map(s => s.count), 1)

  return (
    <div className="animate-fade-up">
      <PageHead title="Informes" sub="Rendimiento del trimestre" right={<span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Q2 2026 · Abr–Jun</span>} />

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <Card pad={22}>
          <div className="flex justify-between items-start mb-[18px]">
            <div><h3 className="text-[16px] font-[600]">Tendencia de ingresos</h3><p className="text-[13px] mt-0.5" style={{ color: 'var(--t3)' }}>Ingresos cerrados, últimas 12 semanas</p></div>
            <div className="text-right">
              <div className="tnum text-[24px] font-[700]">{fmtEuro(totalDiag)}</div>
              <div className="text-[12.5px] font-[600]" style={{ color: 'var(--good)' }}>Diagnósticos</div>
            </div>
          </div>
          <AreaChart data={REV_SERIES} />
          <div className="flex justify-between mt-2.5 text-[11px]" style={{ color: 'var(--t4)' }}>
            {['Sem 1','Sem 4','Sem 8','Sem 12'].map(l => <span key={l}>{l}</span>)}
          </div>
        </Card>

        <Card pad={22} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="text-[16px] font-[600] self-start">Tasa de cierre</h3>
          <div className="flex-1 grid place-items-center py-3.5"><Donut pct={closeRate} /></div>
          <div className="flex gap-[22px] text-[12.5px]">
            <div className="text-center"><div className="tnum text-[18px] font-[650]">{cerrados.length}</div><div style={{ color: 'var(--t3)' }}>Cerrados</div></div>
            <div className="text-center"><div className="tnum text-[18px] font-[650]">{deals.length - cerrados.length}</div><div style={{ color: 'var(--t3)' }}>Abiertos</div></div>
            <div className="text-center"><div className="tnum text-[18px] font-[650]" style={{ color: '#9DB1F2' }}>{fmtEuro(totalImpl)}</div><div style={{ color: 'var(--t3)' }}>Impl.</div></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card pad={22}>
          <h3 className="text-[16px] font-[600] mb-[18px]">Ranking del equipo</h3>
          <div className="flex flex-col gap-4">
            {byOwner.map((o, i) => {
              const total = o.diag + o.impl
              return (
                <div key={o.k} className="flex items-center gap-3">
                  <span className="text-[13px] font-[700] w-4" style={{ color: i === 0 ? '#9DB1F2' : 'var(--t4)' }}>{i + 1}</span>
                  <OwnerChip owner={o.k} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13.5px] font-[500]">{o.name}<span className="ml-2 font-normal" style={{ color: 'var(--t4)' }}>{o.count} ops.</span></span>
                      <span className="tnum text-[13.5px] font-[600]">{fmtEuro(total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s2)' }}>
                      <div style={{ width: `${total / maxOwner * 100}%`, height: '100%', borderRadius: 100, background: i === 0 ? 'var(--accent)' : 'rgba(79,111,232,0.4)', transition: 'width .6s' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card pad={22}>
          <h3 className="text-[16px] font-[600] mb-5">Oportunidades por etapa</h3>
          <div className="flex items-end justify-between gap-2.5 h-[168px]">
            {stageData.map(s => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="tnum text-[12px] font-[600]" style={{ color: 'var(--t2)' }}>{s.count}</span>
                <div style={{ width: '100%', maxWidth: 28, height: `${s.count / maxStage * 100}%`, minHeight: 6, borderRadius: 6, background: s.id === 'cerrado' ? 'var(--accent)' : 'linear-gradient(180deg,rgba(79,111,232,0.6),rgba(79,111,232,0.28))', transition: 'height .6s' }} />
                <span className="text-[9.5px] text-center leading-tight" style={{ color: 'var(--t4)', height: 28 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
