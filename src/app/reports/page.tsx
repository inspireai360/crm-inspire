'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, STAGES, STAGE_PROB, fmtMoney, fmtMoneyK, OWNERS } from '@/lib/types'
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
      <path d={area} fill="url(#ac)"/>
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        <div><div className="tnum text-[26px] font-[700]">{pct}%</div><div className="text-[11.5px]" style={{ color: 'var(--t3)' }}>closed won</div></div>
      </div>
    </div>
  )
}

const REV_SERIES = [820,910,870,1020,980,1140,1090,1210,1180,1290,1360,1420]

export default function ReportsPage() {
  const [deals, setDeals] = useState<Deal[]>([])

  useEffect(() => {
    createClient().from('deals').select('*').then(({ data }) => setDeals(data ?? []))
  }, [])

  const won = deals.filter(d => d.stage === 'won')
  const wonVal = won.reduce((a, d) => a + d.value, 0)
  const closeRate = deals.length > 0 ? Math.round(won.length / deals.length * 100) : 32

  const byOwner = Object.keys(OWNERS).map(k => ({
    k, name: OWNERS[k as keyof typeof OWNERS].name,
    value: deals.filter(d => d.owner === k).reduce((a, d) => a + d.value, 0),
    count: deals.filter(d => d.owner === k).length,
  })).sort((a, b) => b.value - a.value)
  const maxOwner = Math.max(...byOwner.map(o => o.value), 1)

  const stageData = STAGES.map(s => ({ ...s, count: deals.filter(d => d.stage === s.id).length }))
  const maxStage = Math.max(...stageData.map(s => s.count), 1)

  return (
    <div className="animate-fade-up">
      <PageHead title="Reports" sub="Quarter-to-date performance" right={<span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Q2 2026 · Apr–Jun</span>} />

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <Card pad={22}>
          <div className="flex justify-between items-start mb-[18px]">
            <div><h3 className="text-[16px] font-[600]">Revenue trend</h3><p className="text-[13px] mt-0.5" style={{ color: 'var(--t3)' }}>Closed revenue, last 12 weeks</p></div>
            <div className="text-right"><div className="tnum text-[24px] font-[700]">$1.42M</div><div className="text-[12.5px] font-[600]" style={{ color: 'var(--good)' }}>+18.4% QoQ</div></div>
          </div>
          <AreaChart data={REV_SERIES} />
          <div className="flex justify-between mt-2.5 text-[11px]" style={{ color: 'var(--t4)' }}>
            {['Wk 1','Wk 4','Wk 8','Wk 12'].map(l => <span key={l}>{l}</span>)}
          </div>
        </Card>
        <Card pad={22} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="text-[16px] font-[600] self-start">Win rate</h3>
          <div className="flex-1 grid place-items-center py-3.5"><Donut pct={closeRate} /></div>
          <div className="flex gap-[22px] text-[12.5px]">
            <div className="text-center"><div className="tnum text-[18px] font-[650]">{won.length}</div><div style={{ color: 'var(--t3)' }}>Won</div></div>
            <div className="text-center"><div className="tnum text-[18px] font-[650]">{deals.length - won.length}</div><div style={{ color: 'var(--t3)' }}>Open</div></div>
            <div className="text-center"><div className="tnum text-[18px] font-[650]" style={{ color: '#9DB1F2' }}>{fmtMoneyK(wonVal)}</div><div style={{ color: 'var(--t3)' }}>Value</div></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card pad={22}>
          <h3 className="text-[16px] font-[600] mb-[18px]">Rep leaderboard</h3>
          <div className="flex flex-col gap-4">
            {byOwner.map((o, i) => (
              <div key={o.k} className="flex items-center gap-3">
                <span className="text-[13px] font-[700] w-4" style={{ color: i === 0 ? '#9DB1F2' : 'var(--t4)' }}>{i + 1}</span>
                <OwnerChip owner={o.k} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13.5px] font-[500]">{o.name}<span className="ml-2 font-normal" style={{ color: 'var(--t4)' }}>{o.count} deals</span></span>
                    <span className="tnum text-[13.5px] font-[600]">{fmtMoneyK(o.value)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s2)' }}>
                    <div style={{ width: `${o.value / maxOwner * 100}%`, height: '100%', borderRadius: 100, background: i === 0 ? 'var(--accent)' : 'rgba(79,111,232,0.4)', transition: 'width .6s' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card pad={22}>
          <h3 className="text-[16px] font-[600] mb-5">Deals by stage</h3>
          <div className="flex items-end justify-between gap-2.5 h-[168px]">
            {stageData.map(s => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="tnum text-[12.5px] font-[600]" style={{ color: 'var(--t2)' }}>{s.count}</span>
                <div style={{ width: '100%', maxWidth: 30, height: `${s.count / maxStage * 100}%`, minHeight: 6, borderRadius: 6, background: s.id === 'won' ? 'var(--accent)' : 'linear-gradient(180deg,rgba(79,111,232,0.6),rgba(79,111,232,0.28))', transition: 'height .6s' }} />
                <span className="text-[10.5px] text-center leading-tight" style={{ color: 'var(--t4)', height: 24 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
