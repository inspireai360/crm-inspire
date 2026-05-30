'use client'

import { createContext, useContext, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import NewDealModal from '@/components/deals/NewDealModal'
import Toast from '@/components/ui/Toast'

interface CRMCtx { openNewDeal: () => void; showToast: (msg: string) => void }
const CRMContext = createContext<CRMCtx>({ openNewDeal: () => {}, showToast: () => {} })
export const useCRM = () => useContext(CRMContext)

interface Props {
  children: React.ReactNode
  fullHeight?: boolean
}

export default function CRMProvider({ children, fullHeight }: Props) {
  const [modal, setModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  return (
    <CRMContext.Provider value={{ openNewDeal: () => setModal(true), showToast: setToast }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        <Sidebar onNewDeal={() => setModal(true)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          {fullHeight ? (
            <main className="flex-1 overflow-hidden px-[34px] py-[30px] flex flex-col">
              <div className="w-full max-w-[1180px] mx-auto flex flex-col flex-1 min-h-0">
                {children}
              </div>
            </main>
          ) : (
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-[34px] py-[30px]">
              <div className="w-full max-w-[1180px] mx-auto">
                {children}
              </div>
            </main>
          )}
        </div>
      </div>
      {modal && <NewDealModal onClose={() => setModal(false)} onCreated={msg => { setModal(false); setToast(msg) }} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </CRMContext.Provider>
  )
}
