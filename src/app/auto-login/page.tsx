'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DEMO_COMPANIES = [
  { name: 'Inmobiliaria Torres & Asociados', industry: 'Inmobiliaria', size: '12 empleados', website: 'torres-asociados.es' },
  { name: 'Clínica Dental Martínez', industry: 'Salud', size: '8 empleados', website: 'clinicamartinez.es' },
  { name: 'Grupo Logístico Ibérica', industry: 'Logística', size: '28 empleados', website: 'logisticaiberica.com' },
  { name: 'Estudio Jurídico Vidal', industry: 'Legal', size: '6 empleados', website: 'estudiovidal.es' },
  { name: 'Distribuidora Alimentaria Sur', industry: 'Alimentación', size: '19 empleados', website: 'dasur.es' },
]

const DEMO_CONTACTS = [
  { name: 'Carlos Torres', email: 'c.torres@torres-asociados.es', role: 'CEO', type: 'customer', owner: 'LL', value: 4500 },
  { name: 'Ana Martínez', email: 'a.martinez@clinicamartinez.es', role: 'Directora', type: 'prospect', owner: 'ME', value: 2800 },
  { name: 'Javier Ruiz', email: 'j.ruiz@logisticaiberica.com', role: 'COO', type: 'prospect', owner: 'TI', value: 6200 },
  { name: 'Sofía Vidal', email: 's.vidal@estudiovidal.es', role: 'Socia fundadora', type: 'lead', owner: 'LL', value: 1800 },
  { name: 'Miguel Herrera', email: 'm.herrera@dasur.es', role: 'Director Operaciones', type: 'lead', owner: 'ME', value: 3400 },
]

const DEMO_DEALS = [
  { title: 'Inspire Cyber 360 — Torres & Asociados', stage: 'cliente_activo', value: 4500, owner: 'LL', precio_diagnostico: 4500, precio_implementacion: 12000, lead_source: 'linkedin' },
  { title: 'Inspire Cyber 360 — Clínica Martínez', stage: 'diagnostico_activo', value: 2800, owner: 'ME', precio_diagnostico: 2800, precio_implementacion: 8500, lead_source: 'referido' },
  { title: 'Inspire Cyber 360 — Logística Ibérica', stage: 'propuesta_implementacion', value: 6200, owner: 'TI', precio_diagnostico: 6200, precio_implementacion: 18000, lead_source: 'web' },
  { title: 'Inspire Cyber 360 — Estudio Vidal', stage: 'reunion_inicial', value: 1800, owner: 'LL', precio_diagnostico: 1800, precio_implementacion: 5500, lead_source: 'directo' },
  { title: 'Inspire Cyber 360 — Distribuidora Sur', stage: 'lead_nuevo', value: 3400, owner: 'ME', precio_diagnostico: 3400, precio_implementacion: 9800, lead_source: 'linkedin' },
]

const DEMO_ACTIVITIES = [
  { type: 'meeting', text: 'Kickoff con Carlos Torres. Accesos recibidos. Empezamos cuestionarios esta semana.', owner: 'LL', daysAgo: 2 },
  { type: 'email', text: 'Propuesta enviada a Javier Ruiz con dos opciones de alcance (ops + ventas vs. completo).', owner: 'TI', daysAgo: 4 },
  { type: 'call', text: 'Llamada con Ana Martínez. Confirmado dolor principal: gestión de citas y seguimiento post-visita.', owner: 'ME', daysAgo: 6 },
  { type: 'deal', text: 'Deal Logística Ibérica avanzado a Propuesta de Implementación. Esperamos respuesta esta semana.', owner: 'TI', daysAgo: 4 },
  { type: 'note', text: 'Sofía Vidal muy interesada en el área legal/documental. Prioridad: automatización de contratos.', owner: 'LL', daysAgo: 8 },
  { type: 'meeting', text: 'Reunión de entrega con Torres & Asociados. NPS: 10/10. Firmado upsell de implementación.', owner: 'LL', daysAgo: 1 },
]

async function seedDemoData(sb: ReturnType<typeof createClient>, userId: string) {
  // Verificar si ya hay datos
  const { data: existing } = await sb.from('companies').select('id').limit(1)
  if (existing && existing.length > 0) return

  // Crear empresas
  const { data: companies } = await sb.from('companies').insert(
    DEMO_COMPANIES.map(c => ({ ...c, user_id: userId }))
  ).select('id, name')

  if (!companies) return

  // Crear contactos vinculados a empresas
  const { data: contacts } = await sb.from('contacts').insert(
    DEMO_CONTACTS.map((c, i) => ({
      ...c,
      company_id: companies[i]?.id,
      user_id: userId,
      location: 'España',
      lead_source: 'linkedin',
    }))
  ).select('id')

  if (!contacts) return

  // Crear deals vinculados a contactos
  const { data: deals } = await sb.from('deals').insert(
    DEMO_DEALS.map((d, i) => ({
      ...d,
      contact_id: contacts[i]?.id,
      user_id: userId,
      position: i,
      descuento_aplicado: 0,
      ventas_status: 'completado',
      marketing_status: i < 3 ? 'completado' : 'en_progreso',
      operaciones_status: i < 2 ? 'completado' : 'pendiente',
      delivery_status: i === 0 ? 'completado' : 'pendiente',
      close_date: new Date(Date.now() + (30 - i * 7) * 86400000).toISOString().split('T')[0],
    }))
  ).select('id')

  // Crear actividades
  await sb.from('activities').insert(
    DEMO_ACTIVITIES.map((a, i) => ({
      ...a,
      contact_id: contacts[Math.min(i, contacts.length - 1)]?.id,
      deal_id: deals?.[Math.min(i, (deals?.length ?? 1) - 1)]?.id,
      user_id: userId,
      created_at: new Date(Date.now() - a.daysAgo * 86400000).toISOString(),
    }))
  )
}

export default function AutoLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Cargando demo…')
  let attempts = 0

  useEffect(() => {
    const login = async () => {
      attempts++
      const sb = createClient()
      await sb.auth.signOut()
      await new Promise(r => setTimeout(r, 200))

      const { data, error } = await sb.auth.signInWithPassword({
        email: 'demo@inspireai.es',
        password: 'InspireDemo2024!',
      })

      if (!error && data.user) {
        setStatus('Preparando datos de demo…')
        await seedDemoData(sb, data.user.id)
        router.push('/dashboard')
      } else if (attempts < 3) {
        setTimeout(login, 800)
      } else {
        setStatus('Error al cargar la demo. Inténtalo de nuevo.')
      }
    }

    login()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      <p className="text-[14px]" style={{ color: 'var(--t3)' }}>{status}</p>
    </div>
  )
}
