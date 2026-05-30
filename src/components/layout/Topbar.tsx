'use client'

import { usePathname } from 'next/navigation'
import Icon from '@/components/ui/Icon'

const TITLES: Record<string, string> = {
  '/dashboard':    'Inicio',
  '/contacts':     'Contactos',
  '/pipeline':     'Pipeline',
  '/diagnosticos': 'Diagnósticos',
  '/deals':        'Oportunidades',
  '/activities':   'Actividades',
  '/reports':      'Informes',
  '/settings':     'Ajustes',
}

interface TopbarProps { onMenuClick?: () => void }

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const isContact = pathname.startsWith('/contacts/') && pathname !== '/contacts'
  const title = isContact ? 'Ficha de cliente' : (TITLES[pathname] ?? '')

  return (
    <header className="h-[60px] shrink-0 flex items-center justify-between px-4 md:px-[30px] sticky top-0 z-20"
      style={{ borderBottom: '1px solid var(--line)', background: 'rgba(10,10,26,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3">
        {/* Hamburger — solo móvil */}
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-[10px] grid place-items-center transition-all hover:opacity-80"
          style={{ color: 'var(--t3)', background: 'var(--s2)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </button>
        <div className="flex items-center gap-[9px] text-[13px]" style={{ color: 'var(--t3)' }}>
          <span className="hidden sm:inline">InspireAI</span>
          <Icon name="chevR" size={14} className="hidden sm:block" />
          <span className="font-[500]" style={{ color: 'var(--t1)' }}>{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-[10px] grid place-items-center transition-all hover:opacity-80" style={{ color: 'var(--t3)' }}>
          <Icon name="search" size={18} />
        </button>
        <button className="w-9 h-9 rounded-[10px] grid place-items-center transition-all hover:opacity-80 relative" style={{ color: 'var(--t3)' }}>
          <Icon name="bell" size={18} />
          <span className="absolute top-2 right-[9px] w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 0 2px var(--s1)' }} />
        </button>
      </div>
    </header>
  )
}
