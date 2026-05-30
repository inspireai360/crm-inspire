'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: '0 6px 18px -6px rgba(79,111,232,0.7)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 4.5 13H11l-1 9 9-11.5H12l1-8.5Z"/>
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">InspireAI</div>
            <div className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--t4)' }}>CRM</div>
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--s1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
          <h1 className="text-[22px] font-[650] tracking-tight mb-1">Bienvenido</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--t3)' }}>Inicia sesión en tu cuenta</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3.5 py-3 rounded-[10px] text-[14px] outline-none transition-shadow"
                style={{ background: 'var(--s2)', color: 'var(--t1)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}
                onFocus={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--accent-l)')}
                onBlur={e => (e.target.style.boxShadow = 'inset 0 0 0 1px var(--line2)')} />
            </label>

            {error && <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: 'var(--bad)', background: 'rgba(232,111,111,0.1)' }}>{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-[10px] font-[600] text-[14px] text-white transition-all mt-2"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Accediendo…' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-[13px] mt-6" style={{ color: 'var(--t3)' }}>
            ¿Sin cuenta?{' '}
            <Link href="/register" className="font-[550]" style={{ color: '#9DB1F2' }}>Créala aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
