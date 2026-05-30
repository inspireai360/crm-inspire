'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Contact, Deal, Activity, STAGES, STAGE_PROB, fmtMoney } from '@/lib/types'
import Card from '@/components/ui/Card'
import Avatar, { OwnerChip } from '@/components/ui/Avatar'
import { TypeBadge } from '@/components/ui/Badge'
import ActBubble from '@/components/ui/ActBubble'
import ContactForm from '@/components/contacts/ContactForm'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const sb = createClient()
    const [{ data: c }, { data: d }, { data: a }] = await Promise.all([
      sb.from('contacts').select('*, company:companies(id,name)').eq('id', id).single(),
      sb.from('deals').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
      sb.from('activities').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    ])
    setContact(c)
    setDeals(d ?? [])
    setActivities(a ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleUpdate = async (data: Partial<Contact>) => {
    const sb = createClient()
    await sb.from('contacts').update(data).eq('id', id)
    setEditing(false)
    load()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this contact and all their deals?')) return
    const sb = createClient()
    await sb.from('contacts').delete().eq('id', id)
    router.push('/contacts')
  }

  const addNote = async () => {
    const text = prompt('Add a note:')
    if (!text?.trim()) return
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    await sb.from('activities').insert({ type: 'note', text, contact_id: id, owner: 'AR', user_id: user!.id })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )
  if (!contact) return <div className="text-center py-12" style={{ color: 'var(--t3)' }}>Contact not found</div>

  const owner = { AR: { name: 'Ana Reyes', color: '#4F6FE8' }, JT: { name: 'Jordan Tate', color: '#8E7BE8' }, MS: { name: 'Maya Singh', color: '#3FA7A0' } }[contact.owner]

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-[13px] font-[500] mb-[22px] transition-colors hover:text-white" style={{ color: 'var(--t3)' }}>
        <Icon name="chevL" size={16} />Contacts
      </Link>

      <div className="grid gap-[22px] items-start" style={{ gridTemplateColumns: '316px 1fr' }}>
        {/* Sticky sidebar */}
        <div className="sticky top-0 flex flex-col gap-3.5">
          <Card pad={24}>
            <div className="flex flex-col items-center text-center">
              <Avatar name={contact.name} type={contact.type} size={72} />
              <h2 className="text-[19px] font-[650] mt-3.5 tracking-tight">{contact.name}</h2>
              <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{contact.role}</p>
              {/* @ts-ignore */}
              <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--t2)' }}>{contact.company?.name ?? '—'}</p>
              <div className="mt-3.5"><TypeBadge type={contact.type} /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <a href={`mailto:${contact.email}`} className="flex-1 flex items-center justify-center gap-2 py-[7px] rounded-lg text-[13px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <Icon name="mail" size={15} />Email
              </a>
              <a href={`tel:${contact.phone}`} className="flex-1 flex items-center justify-center gap-2 py-[7px] rounded-lg text-[13px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <Icon name="phone" size={15} />Call
              </a>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(true)} className="flex-1 flex items-center justify-center gap-2 py-[7px] rounded-lg text-[13px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <Icon name="edit" size={15} />Edit
              </button>
              <button onClick={handleDelete} className="px-3 py-[7px] rounded-lg text-[13px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'rgba(232,111,111,0.1)', color: 'var(--bad)', boxShadow: 'inset 0 0 0 1px rgba(232,111,111,0.2)' }}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          </Card>

          <Card pad={20}>
            {[
              { icon: 'mail',     label: 'Email',    value: contact.email },
              { icon: 'phone',    label: 'Phone',    value: contact.phone },
              { icon: 'pin',      label: 'Location', value: contact.location },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--t3)' }}><Icon name={row.icon} size={16} /></span>
                <span className="text-[12.5px] w-16" style={{ color: 'var(--t3)' }}>{row.label}</span>
                <span className="text-[13px] ml-auto text-right truncate" style={{ maxWidth: 160 }}>{row.value ?? '—'}</span>
              </div>
            ))}
            <div className="flex items-center gap-[11px] pt-[11px]">
              <span style={{ color: 'var(--t3)' }}><Icon name="people" size={16} /></span>
              <span className="text-[12.5px] w-16" style={{ color: 'var(--t3)' }}>Owner</span>
              <span className="inline-flex items-center gap-2 ml-auto">
                <OwnerChip owner={contact.owner} size={22} /><span className="text-[13px]">{owner?.name}</span>
              </span>
            </div>
          </Card>

          <Card pad={20} style={{ boxShadow: 'inset 0 0 0 1px rgba(79,111,232,0.35)', background: 'linear-gradient(160deg,rgba(79,111,232,0.12),var(--s1) 60%)' }}>
            <span className="text-[12.5px] font-[500]" style={{ color: 'var(--t3)' }}>Account value</span>
            <div className="tnum text-[28px] font-[700] tracking-tight mt-1.5">{fmtMoney(contact.value)}</div>
            <div className="text-[12.5px] mt-1" style={{ color: 'var(--t3)' }}>
              {deals.length} open deal{deals.length !== 1 ? 's' : ''} · Added {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </Card>
        </div>

        {/* Main */}
        <div className="flex flex-col gap-4">
          {/* Open deals */}
          <Card pad={22}>
            <h3 className="text-[16px] font-[600] mb-4">Open deals</h3>
            <div className="flex flex-col gap-2.5">
              {deals.map(d => {
                const st = STAGES.find(s => s.id === d.stage)
                return (
                  <div key={d.id} className="flex items-center gap-3.5 p-3.5 rounded-[12px]" style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                    <ActBubble type="deal" size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-[550] truncate">{d.title}</div>
                      <div className="flex items-center gap-1.5 text-[12.5px] mt-0.5" style={{ color: 'var(--t3)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.stage === 'won' ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }} />
                        {st?.label} · {STAGE_PROB[d.stage]}% probability
                      </div>
                    </div>
                    <span className="tnum text-[16px] font-[650]" style={{ color: '#9DB1F2' }}>{fmtMoney(d.value)}</span>
                  </div>
                )
              })}
              {deals.length === 0 && <p className="text-[13.5px]" style={{ color: 'var(--t3)' }}>No open deals.</p>}
            </div>
          </Card>

          {/* Activity timeline */}
          <Card pad={22}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[16px] font-[600]">Activity timeline</h3>
              <button onClick={addNote} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--t2)' }}>
                <Icon name="plus" size={14} stroke={2} />Add note
              </button>
            </div>
            <div className="relative pl-1">
              {activities.map((a, i) => (
                <div key={a.id} className="flex gap-3.5 relative pb-[22px] last:pb-0">
                  {i < activities.length - 1 && (
                    <div className="absolute left-[16.5px] top-9 bottom-0 w-[1.5px]" style={{ background: 'var(--line2)' }} />
                  )}
                  <ActBubble type={a.type} size={34} />
                  <div className="flex-1 pt-0.5">
                    <div className="text-[13.5px] leading-[1.45]">{a.text}</div>
                    <div className="flex items-center gap-2 mt-[5px]">
                      <OwnerChip owner={a.owner} size={18} />
                      <span className="text-[12px]" style={{ color: 'var(--t4)' }}>
                        {a.owner} · {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-[13.5px]" style={{ color: 'var(--t3)' }}>No activities yet.</p>}
            </div>
          </Card>
        </div>
      </div>

      {editing && (
        <ContactForm title="Edit contact" initial={contact} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
      )}
    </div>
  )
}
