'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { OwnerChip } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { title: 'Workspace', items: [
    { id: 'dashboard',  label: 'Dashboard',  icon: 'grid',     href: '/dashboard' },
    { id: 'contacts',   label: 'Contacts',   icon: 'people',   href: '/contacts' },
    { id: 'pipeline',   label: 'Pipeline',   icon: 'columns',  href: '/pipeline' },
    { id: 'deals',      label: 'Deals',      icon: 'deal',     href: '/deals' },
    { id: 'activities', label: 'Activities', icon: 'activity', href: '/activities' },
  ]},
  { title: 'Insights', items: [
    { id: 'reports', label: 'Reports', icon: 'bars',  href: '/reports' },
    { id: 'inbox',   label: 'Inbox',   icon: 'inbox', href: '/inbox', accent: true },
  ]},
  { title: 'Account', items: [
    { id: 'settings', label: 'Settings', icon: 'tune', href: '/settings' },
  ]},
]

interface SidebarProps {
  onNewDeal?: () => void
  inboxUnread?: number
}

export default function Sidebar({ onNewDeal, inboxUnread = 0 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-[244px] shrink-0 flex flex-col h-full" style={{ background: 'var(--s1)', borderRight: '1px solid var(--line)' }}>
      <div className="px-4 pt-[22px] pb-0">
        {/* Brand */}
        <div className="flex items-center gap-[11px] px-2 pb-[26px]">
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 6px 18px -6px rgba(79,111,232,0.7)' }}>
            <Icon name="spark" size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">InspireAI</div>
            <div className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--t4)' }}>Revenue CRM</div>
          </div>
        </div>

        {/* Create deal CTA */}
        <button onClick={onNewDeal} className="cta-btn w-full flex items-center justify-center gap-2 py-[11px] rounded-[11px] text-[13.5px] font-[600] text-white mb-6 transition-all"
          style={{ background: 'var(--accent)', boxShadow: '0 6px 18px -6px rgba(79,111,232,0.6)' }}>
          <Icon name="plus" size={17} stroke={2} />Create deal
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
                const isInbox = n.id === 'inbox'
                return (
                  <Link key={n.id} href={n.href} className="nav-item relative flex items-center gap-3 px-3 py-[10px] rounded-[10px] text-[13.5px] font-[500] transition-all"
                    style={{ background: active ? 'var(--s3)' : 'transparent', color: active ? '#fff' : 'var(--t3)', boxShadow: active ? 'inset 0 0 0 1px var(--line2)' : 'none' }}>
                    {active && <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded" style={{ background: 'var(--accent)' }} />}
                    <Icon name={n.icon} size={18} style={{ color: active ? 'var(--accent)' : 'inherit' }} />
                    <span className="flex-1">{n.label}</span>
                    {isInbox && inboxUnread > 0 && (
                      <span className="tnum min-w-[20px] h-5 px-1.5 rounded-[7px] grid place-items-center text-[11.5px] font-[600] text-white"
                        style={{ background: 'var(--accent)' }}>{inboxUnread}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="px-4 pb-[22px]">
        <button onClick={handleLogout} className="w-full flex items-center gap-[11px] px-[10px] py-3 rounded-[12px] text-left hover:opacity-80 transition-opacity"
          style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <OwnerChip owner="AR" size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-[550] truncate">Ana Reyes</div>
            <div className="text-[11.5px]" style={{ color: 'var(--t4)' }}>Sign out</div>
          </div>
          <Icon name="dots" size={16} style={{ color: 'var(--t4)' }} />
        </button>
      </div>
    </aside>
  )
}
