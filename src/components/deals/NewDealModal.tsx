'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Contact, STAGES, STAGE_PROB, Owner, fmtMoney } from '@/lib/types'
import Avatar, { OwnerChip } from '@/components/ui/Avatar'
import { TypeBadge } from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'

interface Props { onClose: () => void; onCreated: (msg: string) => void }

export default function NewDealModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState(1)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm] = useState({ title: '', contactId: '', value: '', stage: 'qualified', owner: 'AR' as Owner })
  const [contactQ, setContactQ] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    createClient().from('contacts').select('*, company:companies(name)').then(({ data }) => setContacts(data ?? []))
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const selContact = contacts.find(c => c.id === form.contactId)
  const numValue = parseFloat(form.value) || 0
  const prob = STAGE_PROB[form.stage as keyof typeof STAGE_PROB] ?? 25
  const expected = numValue * (prob / 100)
  const step1Valid = form.title.trim() && form.contactId && numValue > 0
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(contactQ.toLowerCase()) || (c as any).company?.name?.toLowerCase().includes(contactQ.toLowerCase()))

  const inputStyle = { background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }

  const handleCreate = async () => {
    setLoading(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    const { error } = await sb.from('deals').insert({
      title: form.title.trim(), contact_id: form.contactId, stage: form.stage,
      value: numValue, owner: form.owner, user_id: user!.id,
    })
    setLoading(false)
    if (error) return
    // @ts-ignore
    onCreated(`Deal "${form.title}" added to ${STAGES.find(s => s.id === form.stage)?.label} · ${selContact?.company?.name ?? selContact?.name}`)
  }

  const OWNERS_LIST = [
    { k: 'AR' as Owner, name: 'Ana Reyes' },
    { k: 'JT' as Owner, name: 'Jordan Tate' },
    { k: 'MS' as Owner, name: 'Maya Singh' },
  ]

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] grid place-items-center p-6 animate-fade-in" style={{ background: 'rgba(5,5,14,0.72)', backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} className="w-[540px] max-w-full rounded-[22px] overflow-hidden animate-scale-in" style={{ background: 'var(--s1)', boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6), inset 0 0 0 1px var(--line2)' }}>

        {/* Header */}
        <div className="flex justify-between items-start px-7 pt-[22px]">
          <div>
            <h2 className="text-[19px] font-[650] tracking-tight">New deal</h2>
            <p className="text-[13px] mt-[3px]" style={{ color: 'var(--t3)' }}>Step {step} of 2 · {step === 1 ? 'Deal basics' : 'Stage & expected value'}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--t3)', padding: 4, borderRadius: 8 }}><Icon name="close" size={20} /></button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 px-7 py-[18px]">
          {[1, 2].map(n => (
            <div key={n} className="flex-1 h-[3px] rounded-sm transition-all" style={{ background: n <= step ? 'var(--accent)' : 'var(--s3)' }} />
          ))}
        </div>

        {/* Body */}
        <div className="px-7 pb-2 min-h-[282px]">
          {step === 1 ? (
            <div className="animate-fade-up flex flex-col gap-4">
              <label>
                <div className="text-[12.5px] font-[550] mb-[7px]" style={{ color: 'var(--t2)' }}>Deal title</div>
                <input autoFocus value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Platform license — Enterprise"
                  className="w-full px-3.5 py-[11px] rounded-[10px] text-[14px] outline-none transition-shadow"
                  style={inputStyle}
                  onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                  onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
              </label>

              <label>
                <div className="text-[12.5px] font-[550] mb-[7px]" style={{ color: 'var(--t2)' }}>Contact</div>
                <div className="relative">
                  <button onClick={() => setContactOpen(o => !o)}
                    className="w-full px-3.5 py-[11px] rounded-[10px] text-[14px] text-left flex items-center gap-2.5 transition-shadow"
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                    onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')}>
                    {selContact ? <>
                      <Avatar name={selContact.name} type={selContact.type} size={24} />
                      <span>{selContact.name}</span>
                      {/* @ts-ignore */}
                      <span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>· {selContact.company?.name ?? ''}</span>
                    </> : <span style={{ color: 'var(--t3)' }}>Select a contact…</span>}
                    <Icon name="chevD" size={16} style={{ marginLeft: 'auto', color: 'var(--t3)' }} />
                  </button>
                  {contactOpen && (
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-[12px] overflow-hidden z-10 animate-fade-up"
                      style={{ background: 'var(--s2)', boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6), inset 0 0 0 1px var(--line2)' }}>
                      <div className="p-2" style={{ borderBottom: '1px solid var(--line)' }}>
                        <input autoFocus value={contactQ} onChange={e => setContactQ(e.target.value)} placeholder="Search…"
                          className="w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
                          style={{ background: 'var(--s3)', color: 'var(--t1)' }} />
                      </div>
                      <div className="max-h-[196px] overflow-y-auto">
                        {filtered.map(c => (
                          <button key={c.id} onClick={() => { set('contactId', c.id); setContactOpen(false); setContactQ('') }}
                            className="row-btn flex items-center gap-2.5 px-3 py-[9px] w-full text-left transition-colors">
                            <Avatar name={c.name} type={c.type} size={28} />
                            <div className="min-w-0">
                              <div className="text-[13.5px] font-[500]">{c.name}</div>
                              {/* @ts-ignore */}
                              <div className="text-[12px]" style={{ color: 'var(--t3)' }}>{c.company?.name ?? ''}</div>
                            </div>
                            <span className="ml-auto"><TypeBadge type={c.type} /></span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label>
                <div className="flex justify-between mb-[7px]">
                  <span className="text-[12.5px] font-[550]" style={{ color: 'var(--t2)' }}>Deal value</span>
                  <span className="text-[12px]" style={{ color: 'var(--t4)' }}>USD</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--t3)' }}>$</span>
                  <input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0"
                    className="tnum w-full pl-6 pr-3.5 py-[11px] rounded-[10px] text-[14px] outline-none transition-shadow"
                    style={inputStyle}
                    onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                    onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
                </div>
              </label>
            </div>
          ) : (
            <div className="animate-fade-up flex flex-col gap-4">
              <div>
                <div className="text-[12.5px] font-[550] mb-[7px]" style={{ color: 'var(--t2)' }}>Pipeline stage</div>
                <div className="grid grid-cols-3 gap-2">
                  {STAGES.map(s => (
                    <button key={s.id} onClick={() => set('stage', s.id)}
                      className="p-[11px] rounded-[10px] text-left transition-all"
                      style={{ background: form.stage === s.id ? 'rgba(79,111,232,0.14)' : 'var(--s2)', boxShadow: form.stage === s.id ? 'inset 0 0 0 1.5px rgba(79,111,232,0.35)' : 'inset 0 0 0 1px var(--line)' }}>
                      <div className="text-[12.5px] font-[550]" style={{ color: form.stage === s.id ? '#fff' : 'var(--t2)' }}>{s.label}</div>
                      <div className="tnum text-[11.5px] mt-0.5" style={{ color: form.stage === s.id ? '#9DB1F2' : 'var(--t4)' }}>{STAGE_PROB[s.id]}%</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[12.5px] font-[550] mb-[7px]" style={{ color: 'var(--t2)' }}>Owner</div>
                <div className="flex gap-2">
                  {OWNERS_LIST.map(o => (
                    <button key={o.k} onClick={() => set('owner', o.k)}
                      className="flex-1 flex items-center gap-2 px-3 py-[9px] rounded-[10px] transition-all"
                      style={{ background: form.owner === o.k ? 'var(--s3)' : 'var(--s2)', boxShadow: form.owner === o.k ? 'inset 0 0 0 1.5px rgba(79,111,232,0.35)' : 'inset 0 0 0 1px var(--line)' }}>
                      <OwnerChip owner={o.k} size={22} />
                      <span className="text-[12.5px] truncate" style={{ color: form.owner === o.k ? '#fff' : 'var(--t3)' }}>{o.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected value card */}
              <div className="p-[18px] rounded-[14px]" style={{ background: 'linear-gradient(160deg,rgba(79,111,232,0.14),var(--s2) 70%)', boxShadow: 'inset 0 0 0 1px rgba(79,111,232,0.35)' }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[12.5px] font-[500]" style={{ color: 'var(--t2)' }}>Expected value</span>
                  <span className="text-[12px]" style={{ color: 'var(--t3)' }}>{fmtMoney(numValue)} × {prob}%</span>
                </div>
                <div className="tnum text-[34px] font-[700] tracking-tight">{fmtMoney(expected)}</div>
                <div className="h-1.5 rounded-full overflow-hidden mt-3.5" style={{ background: 'var(--s1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${prob}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-7 py-5 mt-2" style={{ borderTop: '1px solid var(--line)' }}>
          {step === 1
            ? <button onClick={onClose} className="text-[13.5px] font-[500] px-1 py-[9px]" style={{ color: 'var(--t3)' }}>Cancel</button>
            : <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-4 py-[9px] rounded-[10px] text-[13.5px] font-[550] transition-all"
                style={{ background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <Icon name="chevL" size={16} />Back
              </button>
          }
          {step === 1
            ? <button onClick={() => step1Valid && setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-[10px] text-[13.5px] font-[600] text-white transition-all"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: step1Valid ? 1 : 0.4, pointerEvents: step1Valid ? 'auto' : 'none' }}>
                Continue<Icon name="chevR" size={16} />
              </button>
            : <button onClick={handleCreate} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-[9px] rounded-[10px] text-[13.5px] font-[600] text-white transition-all"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: loading ? 0.7 : 1 }}>
                <Icon name="check" size={16} stroke={2} />
                {loading ? 'Creating…' : 'Create deal'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
