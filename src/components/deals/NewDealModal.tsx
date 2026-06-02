'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Contact, STAGES, STAGE_PROB, Owner, LeadSource, LEAD_SOURCES, fmtEuro } from '@/lib/types'
import Avatar, { OwnerChip } from '@/components/ui/Avatar'
import { TypeBadge } from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'

interface Props { onClose: () => void; onCreated: (msg: string) => void }

function Label({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex justify-between mb-[7px]">
        <span className="text-[12.5px] font-[550]" style={{ color: 'var(--t2)' }}>{label}</span>
        {hint && <span className="text-[12px]" style={{ color: 'var(--t4)' }}>{hint}</span>}
      </div>
      {children}
    </label>
  )
}

const OWNERS_LIST = [
  { k: 'LL' as Owner, name: 'Lluc · CMO' },
  { k: 'TI' as Owner, name: 'Timur · CTO' },
  { k: 'ME' as Owner, name: 'Merik · COO' },
]

export default function NewDealModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState(1)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm] = useState({
    title: '', contactId: '', precioDiag: '', precioImpl: '', descuento: '',
    stage: 'lead_nuevo', owner: 'LL' as Owner, leadSource: '' as LeadSource | '',
    notionLink: '',
  })
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
  const numDiag    = parseFloat(form.precioDiag) || 0
  const numImpl    = parseFloat(form.precioImpl) || 0
  const numDesc    = parseFloat(form.descuento) || 0
  const prob       = STAGE_PROB[form.stage as keyof typeof STAGE_PROB] ?? 10
  const expectedDiag = numDiag * (prob / 100)
  const step1Valid = form.title.trim() && form.contactId && numDiag > 0

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(contactQ.toLowerCase()) ||
    (c as any).company?.name?.toLowerCase().includes(contactQ.toLowerCase())
  )

  const inputCls = "w-full px-3.5 py-[11px] rounded-[10px] text-[14px] outline-none transition-shadow"
  const inputStyle = { background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }
  const focusOn  = (e: any) => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')
  const focusOff = (e: any) => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')

  const handleCreate = async () => {
    setLoading(true)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    const { error } = await sb.from('deals').insert({
      title: form.title.trim(), contact_id: form.contactId, stage: form.stage,
      value: numDiag + numImpl, owner: form.owner,
      precio_diagnostico: numDiag, precio_implementacion: numImpl, descuento_aplicado: numDesc,
      lead_source: form.leadSource || null, notion_link: form.notionLink || null,
      responsable: form.owner, user_id: user!.id,
    })
    setLoading(false)
    if (error) return
    const stageName = STAGES.find(s => s.id === form.stage)?.label
    // @ts-ignore
    const empresa = selContact?.company?.name ?? selContact?.name
    onCreated(`Oportunidad "${form.title}" añadida a ${stageName} · ${empresa}`)
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] grid place-items-center p-6 animate-fade-in" style={{ background: 'rgba(5,5,14,0.72)', backdropFilter: 'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} className="w-[560px] max-w-full rounded-[22px] overflow-hidden animate-scale-in" style={{ background: 'var(--s1)', boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6), inset 0 0 0 1px var(--line2)' }}>

        {/* Cabecera */}
        <div className="flex justify-between items-start px-7 pt-[22px]">
          <div>
            <h2 className="text-[19px] font-[650] tracking-tight">Nueva oportunidad</h2>
            <p className="text-[13px] mt-[3px]" style={{ color: 'var(--t3)' }}>Paso {step} de 2 · {step === 1 ? 'Datos básicos' : 'Etapa y precios'}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--t3)', padding: 4 }}><Icon name="close" size={20} /></button>
        </div>

        {/* Barra de progreso */}
        <div className="flex gap-1.5 px-7 py-[18px]">
          {[1, 2].map(n => (
            <div key={n} className="flex-1 h-[3px] rounded-sm transition-all" style={{ background: n <= step ? 'var(--accent)' : 'var(--s3)' }} />
          ))}
        </div>

        {/* Cuerpo */}
        <div className="px-7 pb-2 min-h-[300px]">
          {step === 1 ? (
            <div className="animate-fade-up flex flex-col gap-4">
              <Label label="Nombre de la oportunidad">
                <input autoFocus value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="p. ej. Auditoría IA — Cobalt Freight"
                  className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
              </Label>

              <Label label="Contacto">
                <div className="relative">
                  <button onClick={() => setContactOpen(o => !o)}
                    className={`${inputCls} text-left flex items-center gap-2.5`} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {selContact ? <>
                      <Avatar name={selContact.name} type={selContact.type} size={24} />
                      <span>{selContact.name}</span>
                      {/* @ts-ignore */}
                      <span className="text-[12.5px]" style={{ color: 'var(--t3)' }}>· {selContact.company?.name ?? ''}</span>
                    </> : <span style={{ color: 'var(--t3)' }}>Selecciona un contacto…</span>}
                    <Icon name="chevD" size={16} style={{ marginLeft: 'auto', color: 'var(--t3)' }} />
                  </button>
                  {contactOpen && (
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-[12px] overflow-hidden z-10 animate-fade-up"
                      style={{ background: 'var(--s2)', boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6), inset 0 0 0 1px var(--line2)' }}>
                      <div className="p-2" style={{ borderBottom: '1px solid var(--line)' }}>
                        <input autoFocus value={contactQ} onChange={e => setContactQ(e.target.value)} placeholder="Buscar…"
                          className="w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
                          style={{ background: 'var(--s3)', color: 'var(--t1)' }} />
                      </div>
                      <div className="max-h-[180px] overflow-y-auto">
                        {filtered.map(c => (
                          <button key={c.id} onClick={() => { set('contactId', c.id); setContactOpen(false); setContactQ('') }}
                            className="row-btn flex items-center gap-2.5 px-3 py-[9px] w-full text-left">
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
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <Label label="Precio diagnóstico" hint="€">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--t3)' }}>€</span>
                    <input type="number" value={form.precioDiag} onChange={e => set('precioDiag', e.target.value)} placeholder="1500"
                      className={`${inputCls} tnum pl-6`} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </Label>
                <Label label="Precio implementación" hint="€">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--t3)' }}>€</span>
                    <input type="number" value={form.precioImpl} onChange={e => set('precioImpl', e.target.value)} placeholder="12000"
                      className={`${inputCls} tnum pl-6`} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Label label="Fuente del lead">
                  <select value={form.leadSource} onChange={e => set('leadSource', e.target.value)}
                    className={inputCls} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Seleccionar…</option>
                    {LEAD_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Label>
                <Label label="Descuento diagnóstico" hint="€">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: 'var(--t3)' }}>€</span>
                    <input type="number" value={form.descuento} onChange={e => set('descuento', e.target.value)} placeholder="0"
                      className={`${inputCls} tnum pl-6`} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                </Label>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up flex flex-col gap-4">
              <Label label="Etapa del pipeline">
                <div className="grid grid-cols-3 gap-2">
                  {STAGES.map(s => (
                    <button key={s.id} onClick={() => set('stage', s.id)}
                      className="p-[10px] rounded-[10px] text-left transition-all"
                      style={{ background: form.stage === s.id ? 'rgba(79,111,232,0.14)' : 'var(--s2)', boxShadow: form.stage === s.id ? 'inset 0 0 0 1.5px rgba(79,111,232,0.35)' : 'inset 0 0 0 1px var(--line)' }}>
                      <div className="text-[12px] font-[550] leading-tight" style={{ color: form.stage === s.id ? '#fff' : 'var(--t2)' }}>{s.label}</div>
                      <div className="tnum text-[11px] mt-0.5" style={{ color: form.stage === s.id ? '#9DB1F2' : 'var(--t4)' }}>{STAGE_PROB[s.id]}%</div>
                    </button>
                  ))}
                </div>
              </Label>

              <Label label="Responsable">
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
              </Label>

              <Label label="Link Notion (entregable)">
                <input value={form.notionLink} onChange={e => set('notionLink', e.target.value)}
                  placeholder="https://notion.so/…" className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
              </Label>

              {/* Resumen de valor esperado */}
              <div className="p-[18px] rounded-[14px]" style={{ background: 'linear-gradient(160deg,rgba(79,111,232,0.14),var(--s2) 70%)', boxShadow: 'inset 0 0 0 1px rgba(79,111,232,0.35)' }}>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-[11.5px] mb-1" style={{ color: 'var(--t3)' }}>Diagnóstico</div>
                    <div className="tnum text-[17px] font-[650]">{fmtEuro(numDiag)}</div>
                  </div>
                  <div>
                    <div className="text-[11.5px] mb-1" style={{ color: 'var(--t3)' }}>Implementación</div>
                    <div className="tnum text-[17px] font-[650]">{fmtEuro(numImpl)}</div>
                  </div>
                  <div>
                    <div className="text-[11.5px] mb-1" style={{ color: 'var(--t3)' }}>Descuento</div>
                    <div className="tnum text-[17px] font-[650]" style={{ color: 'var(--warn)' }}>-{fmtEuro(numDesc)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12.5px] font-[500]" style={{ color: 'var(--t2)' }}>Valor esperado (diag. × {prob}%)</span>
                  <span className="tnum text-[16px] font-[650]">{fmtEuro(expectedDiag)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s1)' }}>
                  <div style={{ width: `${prob}%`, height: '100%', background: 'var(--accent)', borderRadius: 100, transition: 'width .4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-7 py-5 mt-2" style={{ borderTop: '1px solid var(--line)' }}>
          {step === 1
            ? <button onClick={onClose} className="text-[13.5px] font-[500] px-1 py-[9px]" style={{ color: 'var(--t3)' }}>Cancelar</button>
            : <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-4 py-[9px] rounded-[10px] text-[13.5px] font-[550]"
                style={{ background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <Icon name="chevL" size={16} />Atrás
              </button>
          }
          {step === 1
            ? <button onClick={() => step1Valid && setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-[10px] text-[13.5px] font-[600] text-white"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: step1Valid ? 1 : 0.4, pointerEvents: step1Valid ? 'auto' : 'none' }}>
                Continuar<Icon name="chevR" size={16} />
              </button>
            : <button onClick={handleCreate} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-[9px] rounded-[10px] text-[13.5px] font-[600] text-white"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: loading ? 0.7 : 1 }}>
                <Icon name="check" size={16} stroke={2} />{loading ? 'Guardando…' : 'Crear oportunidad'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
