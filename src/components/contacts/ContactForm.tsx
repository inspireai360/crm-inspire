'use client'

import { useState } from 'react'
import { Contact, ContactType, Owner } from '@/lib/types'
import Icon from '@/components/ui/Icon'

interface Props {
  initial?: Partial<Contact>
  onSubmit: (data: Partial<Contact>) => Promise<void>
  onCancel: () => void
  title: string
}

export default function ContactForm({ initial = {}, onSubmit, onCancel, title }: Props) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    email: initial.email ?? '',
    phone: initial.phone ?? '',
    role: initial.role ?? '',
    type: (initial.type ?? 'lead') as ContactType,
    owner: (initial.owner ?? 'AR') as Owner,
    location: initial.location ?? '',
    value: String(initial.value ?? 0),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const input = "w-full px-3.5 py-[10px] rounded-[10px] text-[14px] outline-none transition-shadow"
  const inputStyle = { background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await onSubmit({ ...form, value: parseFloat(form.value) || 0 })
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-6 animate-fade-in" style={{ background: 'rgba(5,5,14,0.72)', backdropFilter: 'blur(6px)' }}>
      <div className="w-[520px] max-w-full rounded-[22px] overflow-hidden animate-scale-in" style={{ background: 'var(--s1)', boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6), inset 0 0 0 1px var(--line2)' }}>
        <div className="flex justify-between items-center px-7 py-5" style={{ borderBottom: '1px solid var(--line)' }}>
          <h2 className="text-[19px] font-[650] tracking-tight">{title}</h2>
          <button onClick={onCancel} style={{ color: 'var(--t3)' }}><Icon name="close" size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Full name *</div>
              <input value={form.name} onChange={e => set('name', e.target.value)} required className={input} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')} onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Role</div>
              <input value={form.role} onChange={e => set('role', e.target.value)} className={input} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')} onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Email</div>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={input} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')} onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Phone</div>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={input} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')} onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Location</div>
              <input value={form.location} onChange={e => set('location', e.target.value)} className={input} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')} onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Account value ($)</div>
              <input type="number" value={form.value} onChange={e => set('value', e.target.value)} className={input + ' tnum'} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')} onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Type</div>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={input} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
              </select>
            </label>
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Owner</div>
              <select value={form.owner} onChange={e => set('owner', e.target.value)} className={input} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="AR">Ana Reyes</option>
                <option value="JT">Jordan Tate</option>
                <option value="MS">Maya Singh</option>
              </select>
            </label>
          </div>

          {error && <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: 'var(--bad)', background: 'rgba(232,111,111,0.1)' }}>{error}</p>}

          <div className="flex justify-end gap-2.5 pt-2" style={{ borderTop: '1px solid var(--line)' }}>
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-[10px] text-[13.5px] font-[500] transition-all"
              style={{ background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-[600] text-white transition-all"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: loading ? 0.7 : 1 }}>
              <Icon name="check" size={15} stroke={2} />
              {loading ? 'Saving…' : 'Save contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
