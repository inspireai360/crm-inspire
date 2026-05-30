'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Contact } from '@/lib/types'
import ContactsTable from '@/components/contacts/ContactsTable'
import ContactForm from '@/components/contacts/ContactForm'
import { PageHead } from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    const sb = createClient()
    const { data } = await sb.from('contacts').select('*, company:companies(id,name)').order('created_at', { ascending: false })
    setContacts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (data: Partial<Contact>) => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    await sb.from('contacts').insert({ ...data, user_id: user!.id })
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return
    const sb = createClient()
    await sb.from('contacts').delete().eq('id', id)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="animate-fade-up">
      <PageHead
        title="Contacts"
        sub={`${contacts.length} people across ${new Set(contacts.map(c => (c as any).company?.name).filter(Boolean)).size} companies`}
        right={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] text-white"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)' }}>
            <Icon name="plus" size={16} stroke={2} />New contact
          </button>
        }
      />
      <ContactsTable contacts={contacts} onDelete={handleDelete} />
      {showForm && <ContactForm title="New contact" onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
    </div>
  )
}
