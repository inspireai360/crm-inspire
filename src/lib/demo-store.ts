import { DEMO_CONTACTS, DEMO_DEALS, DEMO_ACTIVITIES } from './demo-data'
import type { Contact, Deal, Activity } from './types'

const KEY = 'inspireai_demo_v1'

interface DemoState {
  contacts: Contact[]
  deals: Deal[]
  activities: Activity[]
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch {}
  return { contacts: DEMO_CONTACTS, deals: DEMO_DEALS, activities: DEMO_ACTIVITIES }
}

function save(state: DemoState) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
}

function get(): DemoState { return load() }

export const demoStore = {
  getContacts: (): Contact[] => get().contacts,
  getDeals: (): Deal[] => get().deals,
  getActivities: (): Activity[] => get().activities,

  addContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Contact => {
    const state = get()
    const now = new Date().toISOString()
    const newContact: Contact = { ...contact as Contact, id: crypto.randomUUID(), created_at: now, updated_at: now, user_id: 'demo' }
    state.contacts = [newContact, ...state.contacts]
    save(state)
    return newContact
  },

  updateContact: (id: string, patch: Partial<Contact>) => {
    const state = get()
    state.contacts = state.contacts.map(c => c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c)
    save(state)
  },

  deleteContact: (id: string) => {
    const state = get()
    state.contacts = state.contacts.filter(c => c.id !== id)
    state.deals = state.deals.filter(d => d.contact_id !== id)
    save(state)
  },

  updateDealStage: (id: string, stage: string) => {
    const state = get()
    state.deals = state.deals.map(d => d.id === id ? { ...d, stage: stage as Deal['stage'], updated_at: new Date().toISOString() } : d)
    save(state)
  },

  addActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'user_id'>): Activity => {
    const state = get()
    const newActivity: Activity = { ...activity as Activity, id: crypto.randomUUID(), created_at: new Date().toISOString(), user_id: 'demo' }
    state.activities = [newActivity, ...state.activities]
    save(state)
    return newActivity
  },

  reset: () => {
    try { localStorage.removeItem(KEY) } catch {}
  },
}
