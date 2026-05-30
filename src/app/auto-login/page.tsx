'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AutoLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Accediendo a la demo…')

  useEffect(() => {
    const login = async () => {
      const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
      if (!isDemo) { router.push('/login'); return }

      const sb = createClient()
      const { error } = await sb.auth.signInWithPassword({
        email: 'demo@inspireai.es',
        password: 'InspireDemo2024!',
      })
      if (error) {
        setStatus('Error al cargar la demo. Redirigiendo…')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        router.push('/dashboard')
      }
    }
    login()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      <p className="text-[14px]" style={{ color: 'var(--t3)' }}>{status}</p>
    </div>
  )
}
