export type ContactType = 'lead' | 'prospect' | 'customer'
export type DealStage   = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'contract' | 'won' | 'lost'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'deal' | 'demo' | 'review'
export type Owner = 'AR' | 'JT' | 'MS'

export interface Company {
  id: string
  name: string
  website?: string
  industry?: string
  size?: string
  created_at: string
  user_id: string
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  role?: string
  type: ContactType
  company_id?: string
  company?: Company
  owner: Owner
  location?: string
  value: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface Deal {
  id: string
  title: string
  contact_id?: string
  contact?: Contact
  stage: DealStage
  value: number
  owner: Owner
  close_date?: string
  position: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface Activity {
  id: string
  type: ActivityType
  text: string
  contact_id?: string
  contact?: Contact
  deal_id?: string
  deal?: Deal
  owner: Owner
  scheduled_at?: string
  created_at: string
  user_id: string
}

export interface Message {
  id: string
  contact_id?: string
  contact?: Contact
  subject: string
  preview?: string
  body?: string
  unread: boolean
  created_at: string
  user_id: string
}

// ── Constants ──────────────────────────────────────────────────────────────
export const STAGES: { id: DealStage; label: string; hint: string }[] = [
  { id: 'lead',        label: 'Lead In',     hint: 'New inbound' },
  { id: 'qualified',   label: 'Qualified',   hint: 'Fit confirmed' },
  { id: 'proposal',    label: 'Proposal',    hint: 'Scope sent' },
  { id: 'negotiation', label: 'Negotiation', hint: 'Terms in play' },
  { id: 'contract',    label: 'Contract',    hint: 'Legal / signature' },
  { id: 'won',         label: 'Closed Won',  hint: 'Live engagement' },
]

export const STAGE_PROB: Record<DealStage, number> = {
  lead: 10, qualified: 25, proposal: 50, negotiation: 65, contract: 85, won: 100, lost: 0,
}

export const OWNERS: Record<Owner, { name: string; color: string }> = {
  AR: { name: 'Ana Reyes',   color: '#4F6FE8' },
  JT: { name: 'Jordan Tate', color: '#8E7BE8' },
  MS: { name: 'Maya Singh',  color: '#3FA7A0' },
}

export const fmtMoney  = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
export const fmtMoneyK = (n: number) => n >= 1000 ? '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : '$' + n
