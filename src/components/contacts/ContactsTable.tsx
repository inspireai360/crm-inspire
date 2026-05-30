'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Contact, fmtEuro } from '@/lib/types'
import { TypeBadge } from '@/components/ui/Badge'
import Avatar, { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Card from '@/components/ui/Card'

interface Props { contacts: Contact[]; onDelete: (id: string) => void }

const COLS = [
  { key: 'name',    label: 'Nombre',          w: '26%' },
  { key: 'type',    label: 'Tipo',             w: '13%' },
  { key: 'company', label: 'Empresa',          w: '20%' },
  { key: 'value',   label: 'Valor cuenta',     w: '16%', num: true },
  { key: 'owner',   label: 'Responsable',      w: '11%' },
  { key: 'created', label: 'Alta',             w: '14%' },
]

const TYPE_LABELS: Record<string, string> = { all: 'Todos', lead: 'Leads', prospect: 'Prospectos', customer: 'Clientes' }

export default function ContactsTable({ contacts, onDelete }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all'|'lead'|'prospect'|'customer'>('all')
  const [sort, setSort] = useState({ key: 'name', dir: 1 })

  const filtered = useMemo(() => {
    let r = contacts.filter(c =>
      (filter === 'all' || c.type === filter) &&
      (c.name.toLowerCase().includes(query.toLowerCase()) ||
       ((c as any).company?.name ?? '').toLowerCase().includes(query.toLowerCase()))
    )
    r = [...r].sort((a, b) => {
      const av = sort.key === 'company' ? ((a as any).company?.name ?? '') : (a as any)[sort.key]
      const bv = sort.key === 'company' ? ((b as any).company?.name ?? '') : (b as any)[sort.key]
      return typeof av === 'string' ? av.localeCompare(bv) * sort.dir : (av - bv) * sort.dir
    })
    return r
  }, [contacts, query, filter, sort])

  const toggleSort = (key: string) => setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: 1 })
  const counts = { all: contacts.length, lead: 0, prospect: 0, customer: 0 }
  contacts.forEach(c => { if (c.type in counts) (counts as any)[c.type]++ })

  return (
    <div>
      <div className="flex gap-3 mb-[18px] items-center flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-[360px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }}><Icon name="search" size={16} /></span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar nombre o empresa…"
            className="w-full pl-[38px] pr-3.5 py-2.5 rounded-[10px] text-[13.5px] outline-none transition-shadow"
            style={{ background: 'var(--s1)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}
            onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
            onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
        </div>
        <div className="flex gap-1 p-1 rounded-[11px]" style={{ background: 'var(--s1)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          {(['all','lead','prospect','customer'] as const).map(k => (
            <button key={k} onClick={() => setFilter(k)}
              className="px-[13px] py-[7px] rounded-lg text-[13px] font-[500] transition-all"
              style={{ background: filter === k ? 'var(--s3)' : 'transparent', color: filter === k ? '#fff' : 'var(--t3)', boxShadow: filter === k ? 'inset 0 0 0 1px var(--line2)' : 'none' }}>
              {TYPE_LABELS[k]}<span className="ml-[7px] text-[12px]" style={{ color: 'var(--t4)' }}>{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div className="grid px-[22px]" style={{ gridTemplateColumns: COLS.map(c => c.w).join(' '), borderBottom: '1px solid var(--line)' }}>
          {COLS.map(c => (
            <button key={c.key} onClick={() => toggleSort(c.key)}
              className="flex items-center gap-1.5 py-[13px] text-[12px] font-[600] uppercase tracking-[0.04em] transition-colors"
              style={{ color: sort.key === c.key ? 'var(--t1)' : 'var(--t3)', justifyContent: c.num ? 'flex-end' : 'flex-start', textAlign: 'left' }}>
              {c.label}<Icon name="sort" size={13} style={{ opacity: sort.key === c.key ? 0.9 : 0.3, transform: sort.key === c.key && sort.dir < 0 ? 'scaleY(-1)' : 'none' }} />
            </button>
          ))}
        </div>
        <div>
          {filtered.map((c, i) => (
            <div key={c.id} className="row-btn group grid items-center px-[22px] h-[62px] transition-colors"
              style={{ gridTemplateColumns: COLS.map(cl => cl.w).join(' '), borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 min-w-0">
                <Avatar name={c.name} type={c.type} size={36} />
                <div className="min-w-0">
                  <div className="text-[14px] font-[550] truncate">{c.name}</div>
                  <div className="text-[12px] truncate" style={{ color: 'var(--t3)' }}>{c.role}</div>
                </div>
              </Link>
              <Link href={`/contacts/${c.id}`}><TypeBadge type={c.type} /></Link>
              <Link href={`/contacts/${c.id}`} className="text-[13.5px] truncate pr-3" style={{ color: 'var(--t2)' }}>
                {/* @ts-ignore */}
                {c.company?.name ?? '—'}
              </Link>
              <Link href={`/contacts/${c.id}`} className="tnum text-[14px] font-[600] text-right" style={{ color: c.type === 'customer' ? '#9DB1F2' : 'var(--t1)' }}>
                {fmtEuro(c.value)}
              </Link>
              <Link href={`/contacts/${c.id}`}><OwnerChip owner={c.owner} /></Link>
              <div className="flex items-center justify-between text-[13px]" style={{ color: 'var(--t3)' }}>
                <Link href={`/contacts/${c.id}`}>{new Date(c.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</Link>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onDelete(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red-400"
                    style={{ color: 'var(--t4)' }} title="Eliminar">
                    <Icon name="trash" size={14} />
                  </button>
                  <span className="row-arrow opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--t4)' }}>
                    <Icon name="chevR" size={16} />
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[14px]" style={{ color: 'var(--t3)' }}>Sin contactos que coincidan con la búsqueda.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
