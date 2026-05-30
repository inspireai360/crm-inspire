'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await createClient().auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(63,185,132,0.15)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
        </div>
        <h2 className="text-xl font-[650] mb-2">Revisa tu email</h2>
        <p className="text-sm" style={{ color: 'var(--t3)' }}>Hemos enviado un enlace de confirmación a <strong>{email}</strong>. Haz clic para activar tu cuenta.</p>
        <Link href="/login" className="inline-block mt-6 text-sm font-[550]" style={{ color: '#9DB1F2' }}>Volver al inicio de sesión</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="InspireAI" width={44} height={44}
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 14px -4px rgba(79,111,232,0.5)' }} />
          <div>
            <div className="text-[17px] font-bold tracking-tight">InspireAI</div>
            <div className="text-[12px] font-medium tracking-wide" style={{ color: 'var(--t4)' }}>CRM</div>
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--s1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
          <h1 className="text-[22px] font-[650] tracking-tight mb-1">Crear cuenta</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--t3)' }}>Empieza a gestionar tu pipeline</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <label>
              <div className="text-[12.5px] font-[550] mb-2" style={{ color: 'var(--t2)' }}>Email</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com"
                className="w-full px-3.5 py-3 rounded-[10px] text-[14px] outline-none transition-shadow"
                style={{ background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>
            <label>
              <div className="text-[12.5px] font-[550] mb-2" style={{ color: 'var(--t2)' }}>Contraseña</div>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-3 rounded-[10px] text-[14px] outline-none transition-shadow"
                style={{ background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>

            {error && <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: 'var(--bad)', background: 'rgba(232,111,111,0.1)' }}>{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-[10px] font-[600] text-[14px] text-white transition-all mt-2"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-[13px] mt-6" style={{ color: 'var(--t3)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-[550]" style={{ color: '#9DB1F2' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
