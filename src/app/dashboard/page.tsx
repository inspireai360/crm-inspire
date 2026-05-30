'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Deal, Contact, Activity, STAGES, STAGE_PROB, fmtMoney } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import Sparkline from '@/components/ui/Sparkline'
import ActBubble from '@/components/ui/ActBubble'
import { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

const KPIS_SPARK = {
  revenue:  [22,28,26,34,31,40,38,46,52,49,58,64],
  deals:    [8,9,9,11,10,12,11,13,12,13,14,14],
  close:    [24,26,25,28,27,29,28,30,31,30,32,32],
  velocity: [34,33,32,33,31,30,29,30,28,27,27,26],
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sb = createClient()
    const [{ data: d }, { data: c }, { data: a }] = await Promise.all([
      sb.from('deals').select('*, contact:contacts(name, company:companies(name))').order('created_at', { ascending: false }),
      sb.from('contacts').select('*, company:companies(name)'),
      sb.from('activities').select('*, contact:contacts(name, company:companies(name))').order('created_at', { ascending: false }).limit(8),
    ])
    setDeals(d ?? [])
    setContacts(c ?? [])
    setActivities(a ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const sb = createClient()
    const ch = sb.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, load)
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [load])

  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost')
  const wonDeals    = deals.filter(d => d.stage === 'won')
  const revenue     = wonDeals.reduce((a, d) => a + d.value, 0)
  const closeRate   = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0
  const totalPipe   = deals.reduce((a, d) => a + d.value, 0)

  const stageData = STAGES.map(s => {
    const sd = deals.filter(d => d.stage === s.id)
    return { ...s, count: sd.length, value: sd.reduce((a, d) => a + d.value, 0) }
  })
  const maxVal = Math.max(...stageData.map(s => s.value), 1)

  const kpis = [
    { id: 'revenue',  label: 'Revenue (QTD)',  value: fmtMoney(revenue),         delta: '+18.4%', up: true,  spark: KPIS_SPARK.revenue,  color: 'var(--accent)' },
    { id: 'deals',    label: 'Active deals',   value: String(activeDeals.length), delta: '+3',     up: true,  spark: KPIS_SPARK.deals,    color: 'var(--good)' },
    { id: 'close',    label: 'Close rate',     value: `${closeRate}%`,            delta: '+4.1pt', up: true,  spark: KPIS_SPARK.close,    color: 'var(--good)' },
    { id: 'velocity', label: 'Sales velocity', value: '26 days',                  delta: '−3 days',up: false, spark: KPIS_SPARK.velocity, color: 'var(--accent)' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="animate-fade-up">
      <PageHead title="Dashboard" sub={`${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · Here's where the quarter stands`} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {kpis.map((k, i) => (
          <Card key={k.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-up">
            <div className="flex justify-between items-start mb-[14px]">
              <span className="text-[13px] font-[500]" style={{ color: 'var(--t3)' }}>{k.label}</span>
              <span className="inline-flex items-center gap-[3px] text-[12px] font-[600]" style={{ color: k.up ? 'var(--good)' : '#9DB1F2' }}>
                <Icon name={k.up ? 'arrowUp' : 'arrowDn'} size={13} stroke={2} />{k.delta.replace(/[+−-]/, '')}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2.5">
              <span className="tnum text-[30px] font-[650] tracking-tight">{k.value}</span>
              <Sparkline data={k.spark} color={k.color} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Pipeline by stage */}
        <Card pad={22}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[16px] font-[600]">Pipeline by stage</h3>
              <p className="text-[13px] mt-[3px]" style={{ color: 'var(--t3)' }}>{deals.length} deals · {fmtMoney(totalPipe)} total</p>
            </div>
            <span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>Value weighted</span>
          </div>
          <div className="flex flex-col gap-4">
            {stageData.map(s => (
              <div key={s.id}>
                <div className="flex justify-between mb-[7px] items-baseline">
                  <span className="text-[13.5px] font-[500]">{s.label}
                    <span className="ml-2 font-normal" style={{ color: 'var(--t4)' }}>{s.count}</span>
                  </span>
                  <span className="tnum text-[13.5px] font-[600]" style={{ color: 'var(--t2)' }}>{fmtMoney(s.value)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--s2)' }}>
                  <div style={{ width: `${(s.value / maxVal) * 100}%`, height: '100%', borderRadius: 100, background: s.id === 'won' ? 'var(--accent)' : 'linear-gradient(90deg,rgba(79,111,232,0.55),rgba(79,111,232,0.85))', transition: 'width .6s cubic-bezier(.2,.7,.3,1)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent activity */}
        <Card pad={22}>
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="text-[16px] font-[600]">Recent activity</h3>
            <Link href="/activities" className="text-[12.5px]" style={{ color: 'var(--t3)' }}>See all</Link>
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
            {activities.length === 0 && <p className="text-[13px] py-6 text-center" style={{ color: 'var(--t3)' }}>No activities yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
