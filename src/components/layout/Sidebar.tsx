'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Icon from '@/components/ui/Icon'
import { createClient } from '@/lib/supabase/client'
import { OWNERS, EMAIL_TO_OWNER, Owner } from '@/lib/types'

const NAV = [
  { title: 'Principal', items: [
    { id: 'dashboard',    label: 'Inicio',          icon: 'grid',     href: '/dashboard' },
    { id: 'contacts',     label: 'Contactos',        icon: 'people',   href: '/contacts' },
    { id: 'pipeline',     label: 'Pipeline',         icon: 'columns',  href: '/pipeline' },
    { id: 'diagnosticos', label: 'Diagnósticos',     icon: 'note',     href: '/diagnosticos' },
    { id: 'deals',        label: 'Oportunidades',    icon: 'deal',     href: '/deals' },
    { id: 'activities',   label: 'Actividades',      icon: 'activity', href: '/activities' },
  ]},
  { title: 'Análisis', items: [
    { id: 'reports', label: 'Informes', icon: 'bars', href: '/reports' },
  ]},
  { title: 'Cuenta', items: [
    { id: 'settings', label: 'Ajustes', icon: 'tune', href: '/settings' },
  ]},
]

function UserAvatar({ owner, size = 32 }: { owner: Owner | null; size?: number }) {
  const colors: Record<Owner, string> = { LL: '#4F6FE8', TI: '#8E7BE8', ME: '#3FA7A0' }
  const color = owner ? colors[owner] : '#4F6FE8'
  const label = owner ?? '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center',
      background: 'var(--s3)', color, fontSize: size * 0.38, fontWeight: 600,
      boxShadow: `inset 0 0 0 1.5px ${color}55`, flexShrink: 0,
    }}>{label}</div>
  )
}

interface SidebarProps { onNewDeal?: () => void }

export default function Sidebar({ onNewDeal }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null
      setUserEmail(email)
      if (email) setOwner(EMAIL_TO_OWNER[email] ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  const ownerInfo = owner ? OWNERS[owner] : null
  const displayName = ownerInfo?.name ?? userEmail?.split('@')[0] ?? 'Usuario'
  const displayRole = ownerInfo?.role ?? ''

  return (
    <aside className="w-[244px] shrink-0 flex flex-col h-full" style={{ background: 'var(--s1)', borderRight: '1px solid var(--line)' }}>
      <div className="px-4 pt-[22px] pb-0">
        {/* Brand */}
        <div className="flex items-center gap-[11px] px-2 pb-[26px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="InspireAI"
            width={36}
            height={36}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
              boxShadow: '0 4px 14px -4px rgba(79,111,232,0.5)',
            }}
          />
          <div>
            <div className="text-[15px] font-bold tracking-tight">InspireAI</div>
            <div className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--t4)' }}>CRM</div>
          </div>
        </div>

        {/* Nueva oportunidad CTA */}
        <button onClick={onNewDeal} className="cta-btn w-full flex items-center justify-center gap-2 py-[11px] rounded-[11px] text-[13.5px] font-[600] text-white mb-6 transition-all"
          style={{ background: 'var(--accent)', boxShadow: '0 6px 18px -6px rgba(79,111,232,0.6)' }}>
          <Icon name="plus" size={17} stroke={2} />Nueva oportunidad
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4 pb-4">
        {NAV.map(sec => (
          <div key={sec.title}>
            <div className="text-[11px] font-[600] uppercase tracking-[0.06em] px-2 pb-2" style={{ color: 'var(--t4)' }}>{sec.title}</div>
            <nav className="flex flex-col gap-[3px]">
              {sec.items.map(n => {
                const active = pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
                return (
                  <Link key={n.id} href={n.href}
                    className="nav-item relative flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-[13.5px] font-[500] transition-all"
                    style={{ background: active ? 'var(--s3)' : 'transparent', color: active ? '#fff' : 'var(--t3)', boxShadow: active ? 'inset 0 0 0 1px var(--line2)' : 'none' }}>
                    {active && <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded" style={{ background: 'var(--accent)' }} />}
                    <Icon name={n.icon} size={18} style={{ color: active ? 'var(--accent)' : 'inherit' }} />
                    <span className="flex-1">{n.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="px-4 pb-[22px]">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-[11px] px-[10px] py-3 rounded-[12px] text-left hover:opacity-80 transition-opacity"
          style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <UserAvatar owner={owner} size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-[550] truncate">{displayName}{displayRole ? ` · ${displayRole}` : ''}</div>
            <div className="text-[11.5px] truncate" style={{ color: 'var(--t4)' }}>{userEmail ?? 'Cerrar sesión'}</div>
          </div>
          <Icon name="dots" size={16} style={{ color: 'var(--t4)' }} />
        </button>
      </div>
    </aside>
  )
}
