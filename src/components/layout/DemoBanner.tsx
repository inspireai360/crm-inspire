'use client'

export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null
  return (
    <div className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-[13px] font-[500] text-center"
      style={{ background: 'linear-gradient(90deg,rgba(79,111,232,0.9),rgba(142,123,232,0.9))', color: '#fff' }}>
      <span>👀</span>
      <span>Estás viendo una demo de <strong>InspireAI CRM</strong> — los datos son ficticios y no se pueden modificar.</span>
      <a href="https://inspireai.es#contacto"
        className="ml-2 px-3 py-1 rounded-full text-[12px] font-[600] transition-opacity hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
        Quiero uno para mi empresa →
      </a>
    </div>
  )
}
