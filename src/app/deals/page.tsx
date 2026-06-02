'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Deal, STAGES, STAGE_PROB, LEAD_SOURCES, fmtEuro } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import { StagePill } from '@/components/ui/Badge'
import { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import { demoStore } from '@/lib/demo-store'

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function OportunidadesPage() {
  const [deals, setDeals] = useState<Deal[]>(isDemo ? demoStore.getDeals() : [])
  const [loading, setLoading] = useState(!isDemo)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState({ key: 'precio_diagnostico', dir: -1 })
  const router = useRouter()

  const load = useCallback(async () => {
    if (isDemo) return
    const sb = createClient()
    const { data } = await sb.from('deals').select('*, contact:contacts(name,company:companies(name))').order('created_at', { ascending: false })
    setDeals(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (!isDemo) load() }, [load])

  const rows = useMemo(() => {
    let r = deals.filter(d => filter === 'all' || d.stage === filter)
    r = [...r].sort((a, b) => {
      const av = sort.key === 'expected'
        ? (a.precio_diagnostico + a.precio_implementacion) * STAGE_PROB[a.stage] / 100
        : (a as any)[sort.key]
      const bv = sort.key === 'expected'
        ? (b.precio_diagnostico + b.precio_implementacion) * STAGE_PROB[b.stage] / 100
        : (b as any)[sort.key]
      return typeof av === 'string' ? av.localeCompare(bv) * sort.dir : (av - bv) * sort.dir
    })
    return r
  }, [deals, filter, sort])

  const toggle = (key: string) => setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: key === 'title' ? 1 : -1 })
  const totalDiag = deals.reduce((a, d) => a + (d.precio_diagnostico ?? 0), 0)
  const totalImpl = deals.reduce((a, d) => a + (d.precio_implementacion ?? 0), 0)

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta oportunidad?')) return
    await createClient().from('deals').delete().eq('id', id)
    load()
  }

  const COLS = [
    { key: 'title',              label: 'Oportunidad',        w: '24%' },
    { key: 'stage',              label: 'Etapa',              w: '18%' },
    { key: 'precio_diagnostico', label: 'Diagnóstico',        w: '13%', num: true },
    { key: 'precio_implementacion',label: 'Implementación',   w: '14%', num: true },
    { key: 'expected',           label: 'Esperado',           w: '13%', num: true },
    { key: 'owner',              label: 'Resp.',               w: '8%' },
    { key: '_',                  label: '',                   w: '10%' },
  ]

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} /></div>

  return (
    <div className="animate-fade-up">
      <PageHead title="Oportunidades" sub={`${deals.length} oportunidades · Diag ${fmtEuro(totalDiag)} · Impl ${fmtEuro(totalImpl)}`} />

      <div className="flex gap-1 p-1 rounded-[11px] mb-[18px] w-fit flex-wrap" style={{ background: 'var(--s1)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        {[['all','Todas'], ...STAGES.map(s => [s.id, s.label])].map(([k, label]) => {
          const n = k === 'all' ? deals.length : deals.filter(d => d.stage === k).length
          return (
            <button key={k} onClick={() => setFilter(k)}
              className="px-[13px] py-[7px] rounded-lg text-[13px] font-[500] transition-all"
              style={{ background: filter === k ? 'var(--s3)' : 'transparent', color: filter === k ? '#fff' : 'var(--t3)', boxShadow: filter === k ? 'inset 0 0 0 1px var(--line2)' : 'none' }}>
              {label}<span className="ml-[7px] text-[12px]" style={{ color: 'var(--t4)' }}>{n}</span>
            </button>
          )
        })}
      </div>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div className="grid px-[22px]" style={{ gridTemplateColumns: COLS.map(c => c.w).join(' '), borderBottom: '1px solid var(--line)' }}>
          {COLS.map(c => c.key === '_' ? <div key="_" /> : (
            <button key={c.key} onClick={() => toggle(c.key)}
              className="flex items-center gap-1.5 py-[13px] text-[12px] font-[600] uppercase tracking-[0.04em] transition-colors"
              style={{ color: sort.key === c.key ? 'var(--t1)' : 'var(--t3)', justifyContent: c.num ? 'flex-end' : 'flex-start' }}>
              {c.label}<Icon name="sort" size={13} style={{ opacity: sort.key === c.key ? 0.9 : 0.3, transform: sort.key === c.key && sort.dir < 0 ? 'scaleY(-1)' : 'none' }} />
            </button>
          ))}
        </div>
        {rows.map((d, i) => {
          // @ts-ignore
          const empresa = d.contact?.company?.name ?? d.contact?.name ?? '—'
          const exp = ((d.precio_diagnostico ?? 0) + (d.precio_implementacion ?? 0)) * STAGE_PROB[d.stage] / 100
          return (
            <div key={d.id} className="row-btn group grid items-center px-[22px] h-[62px] cursor-pointer transition-colors"
              style={{ gridTemplateColumns: COLS.map(c => c.w).join(' '), borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}
              onClick={() => d.contact_id && router.push(`/contacts/${d.contact_id}`)}>
              <div className="min-w-0 pr-3">
                <div className="text-[13.5px] font-[550] truncate">{d.title}</div>
                <div className="text-[12px] truncate mt-0.5 flex items-center gap-2" style={{ color: 'var(--t3)' }}>
                  <span>{empresa}</span>
                  {d.lead_source && <span className="px-1.5 py-0.5 rounded-md text-[10.5px]" style={{ background: 'var(--s3)' }}>{LEAD_SOURCES.find(l => l.value === d.lead_source)?.label}</span>}
                </div>
              </div>
              <div><StagePill stage={d.stage} /></div>
              <div className="tnum text-[13.5px] font-[600] text-right">{fmtEuro(d.precio_diagnostico ?? 0)}</div>
              <div className="tnum text-[13.5px] font-[600] text-right">{fmtEuro(d.precio_implementacion ?? 0)}</div>
              <div className="tnum text-[13.5px] font-[600] text-right" style={{ color: '#9DB1F2' }}>{fmtEuro(exp)}</div>
              <div><OwnerChip owner={d.owner} /></div>
              <div className="flex justify-end items-center gap-2">
                {d.notion_link && (
                  <a href={d.notion_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded" style={{ color: 'var(--t3)' }} title="Notion">
                    <Icon name="external" size={14} />
                  </a>
                )}
                <button onClick={e => handleDelete(d.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded" style={{ color: 'var(--t4)' }}>
                  <Icon name="trash" size={14} />
                </button>
                <span className="row-arrow opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--t4)' }}><Icon name="chevR" size={16} /></span>
              </div>
            </div>
          )
        })}
        {rows.length === 0 && <div className="py-12 text-center text-[14px]" style={{ color: 'var(--t3)' }}>Sin oportunidades.</div>}
      </Card>
    </div>
  )
}
