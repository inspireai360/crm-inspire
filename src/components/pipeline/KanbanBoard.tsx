'use client'

import { useState, useCallback } from 'react'
import {
  DndContext, DragOverlay, DragStartEvent, DragEndEvent,
  closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import DealCard from './DealCard'
import { Deal, STAGES, STAGE_PROB, fmtMoney } from '@/lib/types'

interface Props {
  deals: Deal[]
  onStageChange: (dealId: string, newStage: string) => Promise<void>
  onOpenContact: (contactId: string) => void
}

export default function KanbanBoard({ deals, onStageChange, onOpenContact }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null
  const totalWeighted = deals.reduce((a, d) => a + d.value * (STAGE_PROB[d.stage] / 100), 0)

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const onDragEnd = useCallback(async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const dealId = String(active.id)
    const overId = String(over.id)
    // overId is either a column id (stage) or another deal id
    const targetStage = STAGES.find(s => s.id === overId)?.id ?? deals.find(d => d.id === overId)?.stage
    if (targetStage && targetStage !== deals.find(d => d.id === dealId)?.stage) {
      await onStageChange(dealId, targetStage)
    }
  }, [deals, onStageChange])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3.5 flex-1 min-h-0 overflow-x-auto pb-1.5"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, minmax(244px, 1fr))` }}>
        {STAGES.map(stage => {
          const col = deals.filter(d => d.stage === stage.id)
          const sum = col.reduce((a, d) => a + d.value, 0)
          return (
            <KanbanColumn key={stage.id} stage={stage} deals={col} sum={sum} onOpenContact={onOpenContact} />
          )
        })}
      </div>
      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragging onOpenContact={onOpenContact} />}
      </DragOverlay>
    </DndContext>
  )
}
