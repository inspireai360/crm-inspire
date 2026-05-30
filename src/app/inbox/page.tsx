'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/lib/types'
import Card, { PageHead } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const load = useCallback(async () => {
    const sb = createClient()
    const { data } = await sb.from('messages').select('*, contact:contacts(id,name,type)').order('created_at', { ascending: false })
    setMessages(data ?? [])
    if (data && data.length > 0 && !sel) setSel(data[0].id)
    setLoading(false)
  }, [sel])

  useEffect(() => { load() }, [])

  const markRead = async (id: string) => {
    setSel(id)
    const sb = createClient()
    await sb.from('messages').update({ unread: false }).eq('id', id)
    setMessages(ms => ms.map(m => m.id === id ? { ...m, unread: false } : m))
  }

  const msg = messages.find(m => m.id === sel)
  // @ts-ignore
  const msgContact = msg?.contact
  const unreadCount = messages.filter(m => m.unread).length

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} /></div>

  return (
    <div className="animate-fade-up flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <PageHead title="Inbox" sub={`${unreadCount} unread · ${messages.length} conversations`} />
      <Card pad={0} style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden' }}>
        {/* List */}
        <div style={{ borderRight: '1px solid var(--line)', overflowY: 'auto' }}>
          {messages.map(m => {
            // @ts-ignore
            const mc = m.contact
            const active = m.id === sel
            return (
              <button key={m.id} onClick={() => markRead(m.id)}
                className="flex gap-3 p-4 w-full text-left transition-colors relative"
                style={{ borderBottom: '1px solid var(--line)', background: active ? 'var(--s2)' : 'transparent' }}>
                {active && <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded" style={{ background: 'var(--accent)' }} />}
                <Avatar name={mc?.name ?? '?'} type={mc?.type} size={38} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[13.5px] truncate" style={{ fontWeight: m.unread ? 650 : 500 }}>{mc?.name}</span>
                    <span className="text-[11.5px] shrink-0" style={{ color: 'var(--t4)' }}>
                      {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-[12.5px] truncate mt-0.5" style={{ fontWeight: m.unread ? 550 : 400, color: m.unread ? 'var(--t1)' : 'var(--t3)' }}>{m.subject}</div>
                  <div className="text-[12px] truncate mt-0.5" style={{ color: 'var(--t4)' }}>{m.preview}</div>
                </div>
                {m.unread && <span className="w-2 h-2 rounded-full shrink-0 self-center" style={{ background: 'var(--accent)' }} />}
              </button>
            )
          })}
          {messages.length === 0 && <div className="p-8 text-center text-[14px]" style={{ color: 'var(--t3)' }}>No messages.</div>}
        </div>

        {/* Reader */}
        {msg && msgContact ? (
          <div className="flex flex-col overflow-y-auto">
            <div className="flex items-center gap-3.5 px-[26px] py-5" style={{ borderBottom: '1px solid var(--line)' }}>
              <Avatar name={msgContact.name} type={msgContact.type} size={44} />
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-[600]">{msg.subject}</h3>
                <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{msgContact.name}</div>
              </div>
              <button onClick={() => router.push(`/contacts/${msgContact.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-[500] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--t2)' }}>
                <Icon name="external" size={14} />View contact
              </button>
            </div>
            <div className="px-[26px] py-6 text-[14px] leading-[1.7] flex-1 whitespace-pre-wrap" style={{ color: 'var(--t2)' }}>{msg.body}</div>
            <div className="px-[26px] py-4 flex gap-2.5" style={{ borderTop: '1px solid var(--line)' }}>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-[600] text-white transition-all hover:opacity-90"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)' }}>
                <Icon name="mail" size={15} />Reply
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-[550] transition-all hover:opacity-80"
                style={{ background: 'var(--s2)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <Icon name="calendar" size={15} />Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center text-[14px]" style={{ color: 'var(--t3)' }}>Select a message</div>
        )}
      </Card>
    </div>
  )
}
