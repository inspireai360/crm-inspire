'use client'

import { useState, useEffect } from 'react'
import Card, { PageHead } from '@/components/ui/Card'
import { OwnerChip } from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import { createClient } from '@/lib/supabase/client'
import { EMAIL_TO_OWNER, OWNERS, Owner } from '@/lib/types'

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} style={{ width: 42, height: 24, borderRadius: 100, background: on ? 'var(--accent)' : 'var(--s3)', position: 'relative', transition: 'background .18s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .18s cubic-bezier(.3,1.4,.5,1)' }} />
    </button>
  )
}

export default function AjustesPage() {
  const [notif, setNotif] = useState({ resumen: true, menciones: true, etapas: false, semanal: true })
  const [email, setEmail] = useState('')
  const [owner, setOwner] = useState<Owner | null>(null)
  const set = (k: string) => (v: boolean) => setNotif(s => ({ ...s, [k]: v }))

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      const e = data.user?.email ?? ''
      setEmail(e)
      setOwner(EMAIL_TO_OWNER[e] ?? null)
    })
  }, [])

  const ownerInfo = owner ? OWNERS[owner] : null
  const inputCls = "w-full px-3.5 py-[10px] rounded-[10px] text-[14px] outline-none transition-shadow"
  const inputStyle = { background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }

  const Row = ({ title, desc, k }: { title: string; desc: string; k: string }) => (
    <div className="flex items-center gap-4 py-[14px]" style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="flex-1">
        <div className="text-[13.5px] font-[500]">{title}</div>
        <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{desc}</div>
      </div>
      <Toggle on={(notif as any)[k]} set={set(k)} />
    </div>
  )

  return (
    <div className="animate-fade-up max-w-[760px]">
      <PageHead title="Ajustes" sub="Gestiona tu perfil y preferencias" />
      <div className="flex flex-col gap-4">
        <Card pad={24}>
          <h3 className="text-[16px] font-[600] mb-[18px]">Perfil</h3>
          <div className="flex items-center gap-4 mb-[22px]">
            {owner && <OwnerChip owner={owner} size={56} />}
            <div>
              <div className="text-[15px] font-[600]">{ownerInfo?.name ?? email.split('@')[0]}</div>
              <div className="text-[13px] mt-0.5" style={{ color: 'var(--t3)' }}>{ownerInfo?.role ?? ''} · InspireAI</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Nombre</div>
              <input defaultValue={ownerInfo?.name ?? ''} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
            <label>
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Rol</div>
              <input defaultValue={ownerInfo?.role ?? ''} className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
            <label className="col-span-2">
              <div className="text-[12.5px] font-[550] mb-1.5" style={{ color: 'var(--t2)' }}>Email</div>
              <input defaultValue={email} disabled className={inputCls} style={{ ...inputStyle, opacity: 0.6 }} />
            </label>
          </div>
        </Card>

        <Card pad={24}>
          <h3 className="text-[16px] font-[600] mb-1">Notificaciones</h3>
          <Row title="Resumen diario" desc="Un resumen matutino de tu pipeline y tareas" k="resumen" />
          <Row title="Menciones y respuestas" desc="Cuando un compañero te menciona o responde" k="menciones" />
          <Row title="Cambios de etapa" desc="Cuando un deal del que eres responsable cambia de fase" k="etapas" />
          <Row title="Informe semanal" desc="Resumen de rendimiento los lunes por email" k="semanal" />
        </Card>

        <Card pad={24}>
          <h3 className="text-[16px] font-[600] mb-4">Equipo InspireAI</h3>
          <div className="flex flex-col gap-3">
            {(Object.entries(OWNERS) as [Owner, { name: string; role: string; color: string }][]).map(([k, o]) => (
              <div key={k} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--line)' }}>
                <OwnerChip owner={k} size={36} />
                <div>
                  <div className="text-[14px] font-[550]">{o.name}</div>
                  <div className="text-[12.5px]" style={{ color: 'var(--t3)' }}>{o.role}</div>
                </div>
                {k === owner && <span className="ml-auto text-[12px] px-2.5 py-1 rounded-full font-[550]" style={{ background: 'rgba(79,111,232,0.14)', color: '#9DB1F2' }}>Tú</span>}
              </div>
            ))}
          </div>
          <p className="text-[12.5px] mt-4" style={{ color: 'var(--t3)' }}>
            Para añadir un nuevo socio, comparte el enlace de registro:{' '}
            <span className="font-[550]" style={{ color: '#9DB1F2' }}>crm-inspireai.vercel.app/register</span>
          </p>
        </Card>

        <div className="flex justify-end gap-2.5">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[550] hover:opacity-80"
            style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>Cancelar</button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] text-white hover:opacity-90"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)' }}>
            <Icon name="check" size={15} stroke={2} />Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
