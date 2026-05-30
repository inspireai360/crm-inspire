'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Avatar, { OwnerChip } from '@/components/ui/Avatar'
import { Deal, fmtMoney } from '@/lib/types'

interface Props {
  deal: Deal
  isDragging?: boolean
  onOpenContact: (id: string) => void
}

export default function DealCard({ deal, isDragging, onOpenContact }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const isWon = deal.stage === 'won'
  // @ts-ignore
  const contactName = deal.contact?.name ?? 'Unknown'
  // @ts-ignore
  const companyName = deal.contact?.company?.name ?? ''

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: 'var(--s2)', borderRadius: 12, padding: 14, cursor: isDragging ? 'grabbing' : 'grab', boxShadow: isDragging ? '0 12px 30px -8px rgba(0,0,0,0.7),inset 0 0 0 1px rgba(79,111,232,0.35)' : 'inset 0 0 0 1px rgba(255,255,255,0.12)', transition: 'box-shadow .15s, transform .1s' }}
      className="deal-card"
      {...attributes}
      {...listeners}
    >
      <div className="text-[13.5px] font-[550] leading-[1.35] mb-2.5 select-none">{deal.title}</div>
      <div className="flex items-center gap-2 mb-3" onClick={e => { e.stopPropagation(); if (deal.contact_id) onOpenContact(deal.contact_id) }}>
        <Avatar name={contactName} size={24} />
        <span className="text-[12px] truncate select-none" style={{ color: 'var(--t2)' }}>{companyName || contactName}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="tnum text-[14px] font-[650] select-none" style={{ color: isWon ? '#9DB1F2' : '#fff' }}>{fmtMoney(deal.value)}</span>
        <OwnerChip owner={deal.owner} size={20} />
      </div>
    </div>
  )
}
