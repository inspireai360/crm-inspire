export type ContactType = 'lead' | 'prospect' | 'customer'
export type DealStage   = 'lead_nuevo' | 'reunion_inicial' | 'diagnostico_activo' | 'propuesta_implementacion' | 'cliente_activo' | 'cerrado'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'deal' | 'demo' | 'review'
export type Owner = 'AR' | 'JT' | 'MS'
export type LeadSource = 'web' | 'linkedin' | 'referido' | 'directo'
export type AreaStatus = 'pendiente' | 'en_progreso' | 'completado'

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
  // Nuevos campos
  lead_source?: LeadSource
  precio_diagnostico: number
  precio_implementacion: number
  descuento_aplicado: number
  responsable?: Owner
  notion_link?: string
  fecha_inicio?: string
  fecha_entrega?: string
  marketing_status: AreaStatus
  delivery_status: AreaStatus
  operaciones_status: AreaStatus
  fulfillment_status: AreaStatus
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

// ── Etapas del pipeline ───────────────────────────────────────────────────
export const STAGES: { id: DealStage; label: string; hint: string }[] = [
  { id: 'lead_nuevo',              label: 'Lead nuevo',              hint: 'Entrada de lead' },
  { id: 'reunion_inicial',         label: 'Reunión inicial',         hint: 'Primera reunión' },
  { id: 'diagnostico_activo',      label: 'Diagnóstico activo',      hint: 'Auditoría en curso' },
  { id: 'propuesta_implementacion',label: 'Propuesta implementación',hint: 'Propuesta enviada' },
  { id: 'cliente_activo',          label: 'Cliente activo',          hint: 'Implementación en curso' },
  { id: 'cerrado',                 label: 'Cerrado',                 hint: 'Proyecto finalizado' },
]

export const STAGE_PROB: Record<DealStage, number> = {
  lead_nuevo: 10, reunion_inicial: 25, diagnostico_activo: 50,
  propuesta_implementacion: 65, cliente_activo: 85, cerrado: 100,
}

export const OWNERS: Record<Owner, { name: string; color: string }> = {
  AR: { name: 'Ana Reyes',   color: '#4F6FE8' },
  JT: { name: 'Jordan Tate', color: '#8E7BE8' },
  MS: { name: 'Maya Singh',  color: '#3FA7A0' },
}

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: 'web',      label: 'Web' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referido', label: 'Referido' },
  { value: 'directo',  label: 'Directo' },
]

export const AREA_STATUSES: { value: AreaStatus; label: string; color: string }[] = [
  { value: 'pendiente',   label: 'Pendiente',   color: 'rgba(255,255,255,0.28)' },
  { value: 'en_progreso', label: 'En progreso', color: '#E8A24F' },
  { value: 'completado',  label: 'Completado',  color: '#3FB984' },
]

export const AREAS = [
  { key: 'marketing_status',    label: 'Marketing' },
  { key: 'delivery_status',     label: 'Delivery' },
  { key: 'operaciones_status',  label: 'Operaciones' },
  { key: 'fulfillment_status',  label: 'Fulfillment' },
] as const

export const fmtMoney  = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
export const fmtMoneyK = (n: number) => n >= 1000 ? '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : '$' + n
export const fmtEuro   = (n: number) => Math.round(n).toLocaleString('es-ES') + ' €'
