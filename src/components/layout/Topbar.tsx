'use client'

import { usePathname } from 'next/navigation'
import Icon from '@/components/ui/Icon'

const TITLES: Record<string, string> = {
  '/dashboard':  'Overview',
  '/contacts':   'People',
  '/pipeline':   'Deal flow',
  '/deals':      'All deals',
  '/activities': 'Timeline',
  '/reports':    'Analytics',
  '/inbox':      'Messages',
  '/settings':   'Preferences',
}

export default function Topbar() {
  const pathname = usePathname()
  const isContact = pathname.startsWith('/contacts/') && pathname !== '/contacts'
  const title = isContact ? 'Contact' : (TITLES[pathname] ?? '')

  return (
    <header className="h-[60px] shrink-0 flex items-center justify-between px-[30px] sticky top-0 z-20"
      style={{ borderBottom: '1px solid var(--line)', background: 'rgba(10,10,26,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-[9px] text-[13px]" style={{ color: 'var(--t3)' }}>
        <span>InspireAI</span>
        <Icon name="chevR" size={14} />
        <span className="font-[500]" style={{ color: 'var(--t1)' }}>{title}</span>
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
