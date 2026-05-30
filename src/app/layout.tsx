import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InspireAI · CRM',
  description: 'CRM de InspireAI — Gestión de clientes y pipeline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
