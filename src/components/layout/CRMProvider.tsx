'use client'

import { createContext, useContext, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import NewDealModal from '@/components/deals/NewDealModal'
import Toast from '@/components/ui/Toast'
import DemoBanner from './DemoBanner'

interface CRMCtx { openNewDeal: () => void; showToast: (msg: string) => void }
const CRMContext = createContext<CRMCtx>({ openNewDeal: () => {}, showToast: () => {} })
export const useCRM = () => useContext(CRMContext)

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

interface Props { children: React.ReactNode; fullHeight?: boolean }

export default function CRMProvider({ children, fullHeight }: Props) {
  const [modal, setModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openNewDeal = () => { if (!isDemo) setModal(true) }

  return (
    <CRMContext.Provider value={{ openNewDeal, showToast: setToast }}>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        <DemoBanner />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Overlay móvil */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar — fijo en desktop, slide-over en móvil */}
          <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar onNewDeal={openNewDeal} onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            {fullHeight ? (
              <main className="flex-1 overflow-hidden px-4 py-5 md:px-[34px] md:py-[30px] flex flex-col">
                <div className="w-full max-w-[1180px] mx-auto flex flex-col flex-1 min-h-0">
                  {children}
                </div>
              </main>
            ) : (
              <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 md:px-[34px] md:py-[30px]">
                <div className="w-full max-w-[1180px] mx-auto">
                  {children}
                </div>
              </main>
            )}
          </div>
        </div>
      </div>

      {modal && <NewDealModal onClose={() => setModal(false)} onCreated={msg => { setModal(false); setToast(msg) }} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </CRMContext.Provider>
  )
}
