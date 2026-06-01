'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      <p className="text-[14px]" style={{ color: 'var(--t3)' }}>Cargando demo…</p>
    </div>
  )
}
