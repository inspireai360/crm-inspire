'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Contact } from '@/lib/types'
import ContactsTable from '@/components/contacts/ContactsTable'
import ContactForm from '@/components/contacts/ContactForm'
import { PageHead } from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'
import { demoStore } from '@/lib/demo-store'

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(isDemo ? demoStore.getContacts() : [])
  const [loading, setLoading] = useState(!isDemo)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    if (isDemo) { setContacts(demoStore.getContacts()); return }
    const sb = createClient()
    const { data } = await sb.from('contacts').select('*, company:companies(id,name)').order('created_at', { ascending: false })
    setContacts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (!isDemo) load() }, [load])

  const handleCreate = async (data: Partial<Contact>) => {
    if (isDemo) {
      demoStore.addContact({ ...data, type: data.type ?? 'lead', owner: data.owner ?? 'LL', value: data.value ?? 0 } as Contact)
      setContacts(demoStore.getContacts())
      setShowForm(false)
      return
    }
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    await sb.from('contacts').insert({ ...data, user_id: user!.id })
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contacto?')) return
    if (isDemo) { demoStore.deleteContact(id); setContacts(demoStore.getContacts()); return }
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
        title="Contactos"
        sub={`${contacts.length} personas en ${new Set(contacts.map(c => (c as any).company?.name).filter(Boolean)).size} empresas`}
        right={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] text-white"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px -6px rgba(79,111,232,0.5)' }}>
            <Icon name="plus" size={16} stroke={2} />Nuevo contacto
          </button>
        }
      />
      <ContactsTable contacts={contacts} onDelete={handleDelete} />
      {showForm && <ContactForm title="Nuevo contacto" onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
    </div>
  )
}
