'use client'

import { useEffect } from 'react'
import Icon from './Icon'

export default function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-[18px] py-[13px] rounded-[13px] animate-fade-up"
      style={{ background: 'var(--s3)', boxShadow: '0 18px 48px -12px rgba(0,0,0,0.6), inset 0 0 0 1px var(--line2)' }}>
      <span className="w-[26px] h-[26px] rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,111,232,0.14)', color: '#9DB1F2' }}>
        <Icon name="check" size={16} stroke={2.2} />
      </span>
      <span className="text-[13.5px] font-[500]">{msg}</span>
    </div>
  )
}
