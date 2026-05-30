'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DealCard from './DealCard'
import { Deal, fmtEuro } from '@/lib/types'

interface Props {
  stage: { id: string; label: string }
  deals: Deal[]
  sum: number
  onOpenContact: (id: string) => void
}

export default function KanbanColumn({ stage, deals, sum, onOpenContact }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const isCerrado = stage.id === 'cerrado'

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 px-1 pb-3">
        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: isCerrado ? 'var(--accent)' : 'rgba(255,255,255,0.28)' }} />
        <span className="text-[13px] font-[600] leading-tight">{stage.label}</span>
        <span className="text-[12px] font-[500]" style={{ color: 'var(--t4)' }}>{deals.length}</span>
        <span className="tnum ml-auto text-[12px] font-[500]" style={{ color: 'var(--t3)' }}>{fmtEuro(sum)}</span>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2.5 p-2 rounded-[14px] min-h-[120px] transition-all"
        style={{
          background: isOver ? 'rgba(79,111,232,0.14)' : 'rgba(255,255,255,0.018)',
          boxShadow: isOver ? 'inset 0 0 0 1.5px rgba(79,111,232,0.35)' : 'inset 0 0 0 1px rgba(255,255,255,0.07)',
        }}>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(d => (
            <DealCard key={d.id} deal={d} onOpenContact={onOpenContact} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex-1 grid place-items-center text-[12px]" style={{ color: 'var(--t4)' }}>Soltar aquí</div>
        )}
      </div>
    </div>
  )
}
